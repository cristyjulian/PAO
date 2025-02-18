const SITE_TITLE = "PAO";
const User = require("../../models/user");
const Category = require("../../models/category");
const Product = require("../../models/product"); // Import Product model
const Notification = require("../../models/notification");
const Order = require("../../models/order");
const AuctionParticipation = require("../../models/participateAuction.js");
const AuctionSession = require("../../models/auctionSession");
const mongoose = require('mongoose');

module.exports.index = async (req, res) => {
  try {
    console.log("Session Data:", req.session);

    // Check if user is logged in
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }

    console.log('req.params.id:', req.params);
    
    // Fetch auction participation details and ensure product.seller is populated
    const participation = await AuctionParticipation.findById(req.params.productId)
      .populate({
        path: "product",
        populate: { path: "seller", select: "firstName lastName" } // Ensure seller details are included
      })
      .populate("buyer")
      .lean();

    if (!participation || !participation.product) {
      req.flash("error", "Auction not found or has ended.");
      return res.redirect("/buyer");
    }

    console.log("Participation:", participation);
    console.log("Product Data:", participation.product);
    console.log("Seller Data:", participation.product.seller);
    
    const auctionSessioned = await AuctionSession.find({
      product: participation.product._id,
      seller: participation.product.seller._id
    }).populate("buyer").populate("seller").populate("product").lean();

    const allBids = auctionSessioned.flatMap(session => session || []);
    const topBids = allBids
      .map(bid => ({ ...bid, bid: Number(bid.bid) }))
      .sort((a, b) => b.bid - a.bid);

    console.log("🏆 Top Bids:", topBids);

    // Fetch unread notifications
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
    console.log("req", req.body);

    // Check if user is logged in
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }

    // Fetch auction product details and ensure seller details are included
    const product = await Product.findOne({
      _id: new mongoose.Types.ObjectId(req.body.productId),
      status: "approved",
    }).populate("seller", "firstName lastName");

    if (!product) {
      req.flash("error", "Auction not found or has ended.");
      return res.redirect("/buyer");
    }

    // Check for duplicate bid
    const existingBid = await AuctionSession.findOne({
      product: req.body.productId,
      buyer: userLogin._id,
      bid: req.body.submitPrice
    });

    if (existingBid) {
      req.flash("error", "You have already placed this bid.");
      return res.redirect(`/buyer/auction/room/${req.params.productId}`);
    }

    const newBid = new AuctionSession({
      product: req.body.productId,
      seller: product.seller._id,
      buyer: userLogin._id,
      bid: req.body.submitPrice
    });

    await newBid.save();
    res.redirect(`/buyer/auction/room/${req.params.productId}`);
  } catch (error) {
    console.error("Error submitting bid:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/buyer");
  }
};
