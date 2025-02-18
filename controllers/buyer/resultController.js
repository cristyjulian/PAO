const AuctionSession = require("../../models/auctionSession");
const User = require("../../models/user"); // Assuming User model exists for fetching buyer info

module.exports.result = async (req, res) => {
    try {
        const { productId } = req.params; // Product ID passed in the URL
        const auctionSession = await AuctionSession.findOne({ product: productId })
            .populate('product')
            .populate('highestBid.bidder');  // Populate bidder details in the highestBid subdocument

        // Check if auction session exists and has a highest bid
        if (auctionSession && auctionSession.highestBid.bidder) {
            const winner = auctionSession.highestBid.bidder;
            winner.bidAmount = auctionSession.highestBid.amount; // Attach bid amount to winner

            // Get all bids for this product (if needed for ranking)
            const bids = await AuctionSession.find({ product: productId }).populate('highestBid.bidder');
            
            res.render("buyer/result", {
                auctionSession: auctionSession,
                winner: winner, // Winner details
                bids: bids.map(bid => ({
                    name: bid.highestBid.bidder ? bid.highestBid.bidder.name : 'N/A',
                    bidAmount: bid.highestBid.amount
                })),
                auctionEndTime: auctionSession.updatedAt.toISOString() // End time from the auction session
            });
        } else {
            res.render("buyer/result", {
                auctionSession: null,
                winner: null,
                bids: [],
                auctionEndTime: new Date().toISOString()
            });
        }
    } catch (error) {
        console.error("Error fetching auction session:", error);
        res.status(500).send("Server Error");
    }
};
