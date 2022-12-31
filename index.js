import fastify from "fastify";
import sqlite3 from "sqlite3";

const db = new sqlite3.Database("nostr.db");

const app = fastify();

app.get("/follows", async (req, res) => {
  let { pubkey } = req.query;
  try {
    let follows = await new Promise((r, j) => {
      db.all(
        `SELECT tag.value_hex 
        FROM tag 
        WHERE tag.event_id = (
          SELECT event.id 
          FROM event 
          WHERE kind=3 
          AND author = cast(x'${pubkey}' as blob)
          ORDER BY created_at 
          DESC LIMIT 1
        )`,
        (err, rows) => {
          if (err) j(err);
          r(rows.map((r) => r.value_hex.toString("hex")));
        }
      );
    });

    res.send(follows);
  } catch (e) {
    res.code(500).send(e.message);
  }
});

app.get("/followers", async (req, res) => {
  let { pubkey } = req.query;

  try {
    let followers = await new Promise((r, j) => {
      db.all(
        `SELECT author
        FROM (
          SELECT author, max(id) event_id 
          FROM event 
          WHERE kind = 3 
          GROUP BY author
        ) e
        JOIN tag 
        ON tag.event_id = e.event_id 
        WHERE LOWER(HEX(tag.value_hex)) = "${pubkey}"`,
        (err, rows) => {
          if (err) j(err);
          r(rows.map((r) => r.author.toString("hex")));
        }
      );
    });

    res.send(followers);
  } catch (e) {
    res.code(500).send(e.message);
  }
});

const host = "0.0.0.0";
const port = 9393;
app.listen({ host, port }, (err, address) => {
  err && (console.log(err) || process.exit(1));
  console.log(`Server listening on ${address}`);
});
