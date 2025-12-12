import pool from "../config/db.js";

console.log("Adding database indexes for optimization...\n");

const indexes = [
  // User indexes
  {
    name: "idx_users_email",
    sql: "CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email))",
  },
  {
    name: "idx_users_username",
    sql: "CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username))",
  },

  // Post indexes
  {
    name: "idx_posts_user_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)",
  },
  {
    name: "idx_posts_created_at",
    sql: "CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC)",
  },

  // Comment indexes
  {
    name: "idx_comments_post_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)",
  },
  {
    name: "idx_comments_user_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id)",
  },

  // Like indexes
  {
    name: "idx_likes_post_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)",
  },
  {
    name: "idx_likes_user_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id)",
  },
  {
    name: "idx_likes_user_post",
    sql: "CREATE INDEX IF NOT EXISTS idx_likes_user_post ON likes(user_id, post_id)",
  },

  // Follow indexes
  {
    name: "idx_follows_follower_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id)",
  },
  {
    name: "idx_follows_following_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id)",
  },
  {
    name: "idx_follows_both",
    sql: "CREATE INDEX IF NOT EXISTS idx_follows_both ON follows(follower_id, following_id)",
  },

  // Repost indexes
  {
    name: "idx_reposts_post_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_reposts_post_id ON reposts(post_id)",
  },
  {
    name: "idx_reposts_user_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON reposts(user_id)",
  },

  // Bookmark indexes
  {
    name: "idx_bookmarks_user_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id)",
  },
  {
    name: "idx_bookmarks_post_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON bookmarks(post_id)",
  },

  // Notification indexes
  {
    name: "idx_notifications_user_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)",
  },
  {
    name: "idx_notifications_created_at",
    sql: "CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC)",
  },

  // Hashtag indexes
  {
    name: "idx_hashtags_tag",
    sql: "CREATE INDEX IF NOT EXISTS idx_hashtags_tag ON hashtags(tag)",
  },
  {
    name: "idx_post_hashtags_post_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_post_hashtags_post_id ON post_hashtags(post_id)",
  },
  {
    name: "idx_post_hashtags_hashtag_id",
    sql: "CREATE INDEX IF NOT EXISTS idx_post_hashtags_hashtag_id ON post_hashtags(hashtag_id)",
  },
];

async function addIndexes() {
  try {
    let successCount = 0;
    let skipCount = 0;

    for (const index of indexes) {
      try {
        await pool.query(index.sql);
        console.log(`✅ Created: ${index.name}`);
        successCount++;
      } catch (error) {
        if (error.code === "42P07") {
          // Index already exists
          console.log(`⏭️  Skipped: ${index.name} (already exists)`);
          skipCount++;
        } else {
          console.error(`❌ Failed: ${index.name} - ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Created: ${successCount}`);
    console.log(`   ⏭️  Skipped: ${skipCount}`);
    console.log(`   📝 Total: ${indexes.length}`);
    console.log(`\n🎉 Database optimization complete!`);
  } catch (error) {
    console.error("❌ Error adding indexes:", error);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

addIndexes();
