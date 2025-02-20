const SITE_TITLE = "PAO";
const User = require("../../models/user");
const Category = require("../../models/category");
const Product = require("../../models/product"); // Import Product model
const Notification = require("../../models/notification");
const Order = require("../../models/order");
const AuctionParticipation = require("../../models/participateAuction.js");
const AuctionSession = require("../../models/auctionSession");
const mongoose = require('mongoose')

module.exports.index = async (req, res) => {
  try {
    console.log("Session Data:", req.session);

    // Check if user is logged in
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }
    console.log('req.params.id:', req.params)
  

    const participation = await AuctionParticipation.findById(req.params.productId).populate('product').populate('buyer').populate('seller').lean();
    console.log("Participation:", participation);
    const auctionSessioned = await AuctionSession.find({
        product: participation.product._id,
        seller: participation.seller._id
      }).populate('buyer').populate('seller').populate('product').lean(); // Use .lean() for better performance if only reading data
      
      // Extract all bids from the auction sessions
      const allBids = auctionSessioned.flatMap(session => session || []);
      
      // Sort bids by bid amount in descending order (highest first)
      const topBids = allBids
      .map(bid => ({ ...bid, bid: Number(bid.bid) })) // Convert bid to a number
      .sort((a, b) => b.bid - a.bid) // Sort from highest to lowest
    

console.log("🏆 Top Bids:", topBids);
 // Get top 5
      
      console.log("Top 3 Highest Bids:", topBids);
      
// Extract auction start and end time
    const auctionStart = participation.product.auctionStart;
    const auctionEnd = participation.product.auctionEnd;

    console.log("Auction Start:", auctionStart);
    console.log("Auction End:", auctionEnd);
    
    const notifications = await Notification.find({
      user: userLogin._id,
      status: "unread",
    });

    res.render("buyer/AuctionSessionRoom.ejs", {
      site_title: "Auction Session",
      title: "Auction Room",
      req: req,
      messages: req.flash(),
      userLogin,
      topBids,
      currentUrl: req.originalUrl,
      product: participation.product,
      participation,
      notifications,
      auctionStart, // Pass to the view
      auctionEnd,   // Pass to the view
      sellerFirstName: participation.seller.firstName || 'N/A',
      sellerLastName: participation.seller.lastName || 'N/A'
    });
  } catch (error) {
    console.error("Error loading Auction Session Room:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/buyer");
  }
};

module.exports.doBid = async (req, res) => {
  try {
    console.log("Session Data:", req.session);
    console.log("req.body:", req.body);
    console.log("req.params.productId:", req.params.productId);

    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }

    // Fetch the participation details properly
    const participation = await AuctionParticipation.findById(req.params.productId)
      .populate("product")
      .lean();

    if (!participation || !participation.product) {
      req.flash("error", "Auction not found or has ended.");
      return res.redirect(`/buyer/auction/room/${req.params.productId}`);
    }

    // Extract product details correctly
    const { auctionEnd, minPrice } = participation.product;

    const bidAmount = parseFloat(req.body.submitPrice);
    const now = new Date();

    // 🚨 Auction End Time Check
    if (now > new Date(auctionEnd)) {
      req.flash("error", "Auction has already ended! You cannot submit a bid.");
      return res.redirect(`/buyer/auction/room/${req.params.productId}`);
    }

    // 🚨 Minimum Price Check
    if (isNaN(bidAmount) || bidAmount <= minPrice) {
      req.flash("error", `Your bid must be higher than the minimum price of ₱${minPrice}.`);
      return res.redirect(`/buyer/auction/room/${req.params.productId}`);
    }

    // Save the bid
    const bid = new AuctionSession({
      product: participation.product._id,
      seller: participation.product.seller,
      buyer: userLogin._id,
      bid: bidAmount,
    });

    await bid.save();

    res.redirect(`/buyer/auction/room/${req.params.productId}`);
  } catch (error) {
    console.error("Error processing bid:", error);
    req.flash("error", "Something went wrong.");
    
    // ✅ Instead of redirecting to `/buyer`, go back to the auction room
    res.redirect(`/buyer/auction/room/${req.params.productId}`);
  }
};
