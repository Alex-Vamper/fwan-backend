const mongoose = require('mongoose');

const CrateSchema = new mongoose.Schema({
  crateId: { type: String, required: true, unique: true },
  location: { type: String, default: '' }, // Delivery destination
  locationDetails: { type: String, default: '' }, // Current GPS-based location
  assignedWarehouse: { type: String, default: '' }, // Assigned base warehouse
  previousStatus: { type: String, default: null }, 

  status: {
    type: String,
    enum: ['available', 'in_transit', 'delivered', 'flagged', 'maintenance'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'flagged'], // ✅ 'flagged' lowercase added
    default: 'Excellent'
  },

  flagDetails: {
    reason: { type: String },
    description: { type: String }
  },

  linkedOrder: { type: String, default: null },

  temperature: { type: String, default: null },
  humidity: { type: String, default: null },

  crateStatus: { type: String, default: 'Open' }, // Open | Closed
  coolingUnit: { type: String, default: 'Inactive' },
  sensors: { type: String, default: 'Offline' },

  tempUpper: { type: Number, default: null },
  tempLower: { type: Number, default: null },
  humidityUpper: { type: Number, default: null },
  humidityLower: { type: Number, default: null },

  lastUpdate: { type: Date, default: Date.now },

  thresholds: {
    temperature: {
      min: { type: Number, default: 2 },
      max: { type: Number, default: 8 }
    },
    humidity: {
      min: { type: Number, default: 40 },
      max: { type: Number, default: 80 }
    }
  }
});

module.exports = mongoose.model('Crate', CrateSchema);
