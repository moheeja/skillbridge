require('dotenv').config()
const { neon } = require('@neondatabase/serverless')
const sql = neon(process.env.DATABASE_URL)

async function main() {
  // Get trainer
  const trainers = await sql`SELECT id, name FROM users WHERE role = 'trainer' LIMIT 1`
  if (trainers.length === 0) { console.log('❌ No trainer found!'); return }
  const trainer = trainers[0]
  console.log('✅ Trainer:', trainer.name, '| ID:', trainer.id)

  // Get or create institution user
  let institutions = await sql`SELECT id, name FROM users WHERE role = 'institution' LIMIT 1`
  let institutionUserId
  if (institutions.length === 0) {
    console.log('⚠️ No institution user found, using trainer institution_id=1')
    institutionUserId = 1
  } else {
    institutionUserId = institutions[0].id
    console.log('✅ Institution:', institutions[0].name, '| ID:', institutionUserId)
  }


    // Create 3 batches
  const batchNames = ['Batch A', 'Batch B', 'Batch C']

  for (const name of batchNames) {
    const batch = await sql`
      INSERT INTO batches (name, institution_id)
      VALUES (${name}, ${institutionUserId})
      RETURNING *
    `
    console.log('✅ Batch created!', batch[0])

    // Link trainer to batch
    await sql`
      INSERT INTO batch_trainers (batch_id, trainer_id)
      VALUES (${batch[0].id}, ${trainer.id})
    `
    console.log('✅ Trainer linked to batch!')
  }

  console.log('')
  console.log('🎉 Done! Refresh Trainer Dashboard now.')
}

main().catch(console.error)