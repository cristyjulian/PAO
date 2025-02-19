const mongoose = require('mongoose');

// Define the bid sub-schema
const bidSchema = new mongoose.Schema({
    amount: { type: Number, required: true },
    bidder: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });  // Add timestamp for each bid

// Define the main auction session schema
const auctionSessionSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bids: [bidSchema],  // Store all the bids placed by buyers
    bid: { type: String, ref: 'User', required: true },  // The current bid (highest bid at the moment)
}, { timestamps: true });

// Create the AuctionSession model
const AuctionSession = mongoose.model('AuctionSession', auctionSessionSchema);

module.exports = AuctionSession;
