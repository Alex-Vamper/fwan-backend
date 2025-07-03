const mongoose = require('mongoose');
const Crate = require('./models/Crate'); // update path if needed

const MONGO_URI = 'mongodb://127.0.0.1:27017/fwan'; // change if needed

async function fixCrateStatuses() {
  await mongoose.connect(MONGO_URI);

  // Fix "in transit" -> "in_transit"
  await Crate.updateMany({ status: 'in transit' }, { status: 'in_transit' });

  // Fix "at warehouse" -> "available"
  await Crate.updateMany({ status: 'at warehouse' }, { status: 'available' });

  // Optionally handle other known mistakes
  await Crate.updateMany({ status: 'availble' }, { status: 'available' });

  console.log('✅ Crate statuses have been fixed.');
  mongoose.disconnect();
}

fixCrateStatuses().catch(err => {
  console.error('❌ Error fixing statuses:', err);
  mongoose.disconnect();
});
