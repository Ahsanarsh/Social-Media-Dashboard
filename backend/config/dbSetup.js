import pool from "./db.js";

const dbSetup = async () => {
  try {
    // -- Users (extended)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            bio TEXT,
            avatar VARCHAR(255),
            cover_photo VARCHAR(255),
            location VARCHAR(100),
            website VARCHAR(255),
            verified BOOLEAN DEFAULT false,
            email_verified BOOLEAN DEFAULT false,
            verification_token VARCHAR(255),
            verification_expires TIMESTAMPTZ,
            followers_count INTEGER DEFAULT 0,
            following_count INTEGER DEFAULT 0,
            posts_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
        `);

    // // Add columns if they don't exist (for existing tables)
    // await pool.query(`
    //     DO $$
    //     BEGIN
    //         BEGIN
    //             ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
    //         EXCEPTION
    //             WHEN duplicate_column THEN NULL;
    //         END;
    //         BEGIN
    //             ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);
    //         EXCEPTION
    //             WHEN duplicate_column THEN NULL;
    //         END;
    //         BEGIN
    //             ALTER TABLE users ADD COLUMN verification_expires TIMESTAMPTZ;
    //         EXCEPTION
    //             WHEN duplicate_column THEN NULL;
    //         END;
    //     END $$;
    // `);

    // -- Posts

    await pool.query(`
        CREATE TABLE IF NOT EXISTS posts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            image_url VARCHAR(255),
            likes_count INTEGER DEFAULT 0,
            comments_count INTEGER DEFAULT 0,
            reposts_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`);
    // -- Follows

    await pool.query(`
        CREATE TABLE IF NOT EXISTS follows (
            id SERIAL PRIMARY KEY,
            follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(follower_id, following_id),
            CHECK (follower_id != following_id)
);
`);
    // -- Likes
    await pool.query(`
        CREATE TABLE IF NOT EXISTS likes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, post_id)
);
`);
    // -- Comments
    await pool.query(`
        CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            parent_comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            likes_count INTEGER DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`);
    // -- Comment Likes
    await pool.query(`
        CREATE TABLE IF NOT EXISTS comment_likes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, comment_id)
);
`);
    // -- Reposts
    await pool.query(`
        CREATE TABLE IF NOT EXISTS reposts (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            quote_text TEXT,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, post_id)
);
`);
    // -- Bookmarks
    await pool.query(`  
        CREATE TABLE IF NOT EXISTS bookmarks (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, post_id)
);
`);
    // -- Notifications
    await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            actor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            type VARCHAR(50) CHECK (type IN ('follow', 'like', 'comment', 'repost', 'mention')),
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
            content TEXT,
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`);
    // -- Hashtags
    await pool.query(`
        CREATE TABLE IF NOT EXISTS hashtags (
            id SERIAL PRIMARY KEY,
            tag VARCHAR(100) UNIQUE NOT NULL,
            posts_count INTEGER DEFAULT 0,
            trending_score DECIMAL(10,2) DEFAULT 0,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`);

    // -- Post Hashtags (junction table)
    await pool.query(`
        CREATE TABLE IF NOT EXISTS post_hashtags (
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            hashtag_id INTEGER REFERENCES hashtags(id) ON DELETE CASCADE,
            PRIMARY KEY (post_id, hashtag_id)
);
`);
    // -- Mentions
    await pool.query(`
        CREATE TABLE IF NOT EXISTS mentions (
            id SERIAL PRIMARY KEY,
            post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
            mentioned_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
`);
    // -- Refresh Tokens
    await pool.query(`
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            token VARCHAR(500) NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,
            revoked BOOLEAN DEFAULT false,
            created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
    `);
    console.log("Table created successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    process.exit(1);
  }
};

dbSetup();
