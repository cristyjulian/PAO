
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const User = require('../../models/user');
const Category = require('../../models/category');
const Product = require('../../models/product');
const upload = require('../../middlewares/uploads');
const Notification = require('../../models/notification');
const Order = require('../../models/order');
const ResultAuction = require('../../models/resultAuction'); // Import ResultAuction model
const AuctionSession = require('../../models/auctionSession');

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const User = require("../../models/user");
const Category = require("../../models/category");
const Product = require("../../models/product");
const upload = require("../../middlewares/uploads");
const Notification = require("../../models/notification");
const Order = require("../../models/order");


const SITE_TITLE = "PAO";

module.exports.index = async (req, res) => {
  try {
    const userLogin = await User.findById(req.session.login);
    if (!userLogin) {

            req.flash('error', 'Please log in first.');
            return res.redirect('/login');
    }

    const categories = await Category.find();

    // Fetch only the products added by the logged-in farmer and exclude rejected ones
        const products = await Product.find({ seller: req.session.login, status: { $ne: 'rejected' } });

    // Separate products by type
        const retailProducts = products.filter(product => product.productType === 'retail');
        const wholesaleProducts = products.filter(product => product.productType === 'wholesale');

    // Group products by category
        const groupedProducts = categories.map(category => ({
      category,
            retailProducts: retailProducts.filter(product => product.category.toString() === category._id.toString()),
            wholesaleProducts: wholesaleProducts.filter(product => product.category.toString() === category._id.toString())
    }));

    // ✅ If there's a notification ID in the query, update it to "read"
    if (req.query.notification_id) {
            await Notification.findByIdAndUpdate(req.query.notification_id, { status: 'read' });
    }

    // Fetch unread notifications
    const notifications = await Notification.find({ user: req.session.login });

        res.render('farmer/index.ejs', {
      site_title: SITE_TITLE,
            title: 'Home',
      session: req.session,
      categories,
      userLogin,
      groupedProducts,
      retailProducts,
      wholesaleProducts,
      messages: req.flash(),
      currentUrl: req.originalUrl,
      notifications,
    });
  } catch (error) {
        console.error('Error loading farmer dashboard:', error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/login');
  }
};
=======
      req.flash("error", "Please log in first.");
      return res.redirect("/login");
    }
>>>>>>> c42aa9918de99db9345067f94708590f6dedf2ff

    const categories = await Category.find();

    // Fetch only the products added by the logged-in farmer and exclude rejected ones
    const products = await Product.find({
      seller: req.session.login,
      status: { $ne: "rejected" },
    });

    // Separate products by type
    const retailProducts = products.filter(
      (product) => product.productType === "retail"
    );
    const wholesaleProducts = products.filter(
      (product) => product.productType === "wholesale"
    );

    // Group products by category
    const groupedProducts = categories.map((category) => ({
      category,
      retailProducts: retailProducts.filter(
        (product) => product.category.toString() === category._id.toString()
      ),
      wholesaleProducts: wholesaleProducts.filter(
        (product) => product.category.toString() === category._id.toString()
      ),
    }));

    // ✅ If there's a notification ID in the query, update it to "read"
    if (req.query.notification_id) {
      await Notification.findByIdAndUpdate(req.query.notification_id, {
        status: "read",
      });
    }

    // Fetch unread notifications
    const notifications = await Notification.find({ user: req.session.login });

    res.render("farmer/index.ejs", {
      site_title: SITE_TITLE,
      title: "Home",
      session: req.session,
      categories,
      userLogin,
      groupedProducts,
      retailProducts,
      wholesaleProducts,
      messages: req.flash(),
      currentUrl: req.originalUrl,
      notifications,
    });
  } catch (error) {
    console.error("Error loading farmer dashboard:", error);
    req.flash("error", "Something went wrong.");
    res.redirect("/login");
  }
};

module.exports.addProduct = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
<<<<<<< HEAD
            req.flash('error', err.message);
            return res.redirect('/farmer/index');
    }

    if (!req.file) {
            req.flash('error', 'Please upload a product image.');
            return res.redirect('/farmer/index');
=======
      req.flash("error", err.message);
      return res.redirect("/farmer/index");
    }

    if (!req.file) {
      req.flash("error", "Please upload a product image.");
      return res.redirect("/farmer/index");
>>>>>>> c42aa9918de99db9345067f94708590f6dedf2ff
    }

    const {
      category,
      productType,
      name,
      minPrice,
      productInfo,
      auctionStart,
      auctionEnd,
      pickupAddress,
    } = req.body;

<<<<<<< HEAD
        if (!category || !productType || !name || !minPrice || !productInfo || !pickupAddress) {
            req.flash('error', 'All fields, including pickup address, are required.');
            return res.redirect('/farmer/index');
    }

    try {
            const productImagePath = '/img/product/' + req.file.filename;

            // Ensure auction fields are stored only if they are provided
=======
    if (
      !category ||
      !productType ||
      !name ||
      !minPrice ||
      !productInfo ||
      !pickupAddress
    ) {
      req.flash("error", "All fields, including pickup address, are required.");
      return res.redirect("/farmer/index");
    }

    try {
      const productImagePath = "/img/product/" + req.file.filename;

      // Create a new product with status "pending"
>>>>>>> c42aa9918de99db9345067f94708590f6dedf2ff
      const newProduct = new Product({
        category,
        productType,
        name,
        minPrice,
        productInfo,
        image: productImagePath,
        seller: req.session.login,
        pickupAddress,
        auctionStart: productType === "wholesale" ? auctionStart || null : null,
        auctionEnd: productType === "wholesale" ? auctionEnd || null : null,
        status: "pending", // ✅ Default status: pending approval
      });

      await newProduct.save();

      console.log("New product added, awaiting admin approval:", newProduct);

      req.flash(
        "success",
        `Product submitted for approval. Awaiting admin review.`
      );
      res.redirect("/farmer/index");
    } catch (error) {
      console.error("Error saving product:", error);
      req.flash("error", "Error saving product: " + error.message);
      res.redirect("/farmer/index");
    }
  });
};

module.exports.getBuyers = async (req, res) => {
  try {
    // Find orders where the product belongs to the farmer
    const orders = await Order.find({})
      .populate("buyer", "name")
      .populate("product", "name");

    if (!orders || orders.length === 0) {
      return res.json([]);
    }

    const buyerData = orders.map((order) => ({
      _id: order._id,
      buyerName: order.buyer.name,
      productName: order.product.name, // Ensure this is the correct field in your Product schema
      quantity: order.quantity,
      status: order.status,
    }));

    res.json(buyerData);
  } catch (error) {
    console.error("Error fetching buyers:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports.markNotificationAsRead = async (req, res) => {
  try {
    const notificationId = req.query.notification_id; // Use query param here
    const notification = await Notification.findById(notificationId);

    if (notification) {
      notification.status = "read"; // Update the status
      await notification.save();
    }

    // After marking as read, redirect back to the farmer dashboard
    res.redirect("/farmer/index");
  } catch (error) {
    console.error("Error updating notification status:", error);
    req.flash("error", "Failed to update notification.");
    res.redirect("/farmer/index");
  }
};

module.exports.getFarmerOrders = async (req, res) => {
  try {
    const farmerId = req.session.login; // Farmer's ID

    if (!farmerId) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    // Fetch orders where the product belongs to the farmer
    const orders = await Order.find({})
      .populate({
        path: "product",
        match: { seller: farmerId },
        select: "name seller status", // Ensure seller is included
      })
      .populate("buyer", "firstName lastName email"); // Fetch buyer details

    // Debugging output
    console.log(
      "Orders with populated buyer:",
      JSON.stringify(orders, null, 2)
    );

    // Filter out orders where product.seller does not match farmerId
    const farmerOrders = orders.filter(
      (order) =>
        order.product && order.product.seller.toString() === farmerId.toString()
    );

    // Map filtered orders to a clean format
    const ordersData = farmerOrders.map((order) => ({
      _id: order._id,
      buyerName: order.buyer
        ? `${order.buyer.firstName} ${order.buyer.lastName}`
        : "Unknown Buyer", // Fix missing name issue
      productName: order.product ? order.product.name : "Unknown Product",
      quantity: order.quantity,
      totalPrice: order.totalPrice, // ✅ Added total price
      status: order.status,
    }));

    res.json(ordersData);
  } catch (error) {
    console.error("Error fetching farmer orders:", error);
    res.status(500).json({ error: "Server error." });
  }
};

module.exports.processOrder = async (req, res) => {
  const { orderId, action } = req.body;

  try {
    const updatedStatus = action === "approve" ? "Approved" : "Rejected";

    // ✅ Find and update the order
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status: updatedStatus },
      { new: true }
    ).populate("product"); // Ensure we get the product details

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Ensure the order has a product before sending the notification
    if (!order.product) {
      return res
        .status(400)
        .json({ message: "Order does not have a valid product." });
    }

    // ✅ Create notification for the buyer if the order is approved
    if (updatedStatus === "Approved") {
      const notification = new Notification({
        user: order.buyer, // Buyer ID
        message: `Your order for '${order.product.name}' has been approved by the seller. Your order is ready to pick up.`,
        status: "unread",
      });

      await notification.save();
    }

    res.json({ message: `Order ${updatedStatus.toLowerCase()} successfully!` });
  } catch (error) {
    console.error("❌ Error processing order:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

<<<<<<< HEAD

module.exports.getBuyersForProducts = async (req, res) => {
  try {
    const { productId } = req.params;

    // ✅ Find all orders with this product ID and get the buyer details
    const orders = await Order.find({ product: productId, status: "Approved" })
      .populate("buyer", "firstName lastName") // Populate only the buyer's first and last name
      .exec();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No buyers found for this product." });
=======
module.exports.showBuyer = async (req, res) => {
    try {
        const productId = req.query.productId;
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        // Fetch orders for the given productId
        const orders = await Order.find({ product: productId }).populate('buyer', 'firstName lastName');
console.log('b',orders)
        // Extract buyer details
        const buyers = orders.map(order => ({
            firstName: order.buyer ? order.buyer.firstName : "Unknown",
            lastName: order.buyer ? order.buyer.lastName : "Buyer"
        }));

        // Send JSON response instead of rendering a new page
        return res.json({ buyers });

    } catch (error) {
        console.error("Error fetching buyers:", error);
        return res.status(500).json({ error: "Server error" });
>>>>>>> c42aa9918de99db9345067f94708590f6dedf2ff
    }

    // ✅ Extract buyers' details
    const buyers = orders.map(order => ({
      firstName: order.buyer.firstName,
      lastName: order.buyer.lastName
    }));

    res.json({ buyers });
  } catch (error) {
    console.error("❌ Error fetching buyers:", error);
    res.status(500).json({ message: "Server error", error });
  }
};







module.exports.showParticipated = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.session.login })
      .populate("product", "name seller")
      .populate("seller", "name email");

    if (!orders.length) {
      return res.status(404).json({ message: "No participated orders found." });
    }

    res.json(orders);
  } catch (error) {
    console.error("Error fetching participated orders:", error);
    res.status(500).json({ error: "Server error" });
  }
<<<<<<< HEAD
};

module.exports.processAuctionResult = async (req, res) => {
  const { auctionId } = req.body;

  try {
    // ✅ Find the auction and ensure it exists
    const auction = await Auction.findById(auctionId).populate("product").populate("highestBidder");

    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    if (!auction.highestBidder) {
      return res.status(400).json({ message: "No bids were placed on this auction." });
    }

    // ✅ Update the auction status to 'Completed'
    auction.status = "Completed";
    await auction.save();

    // ✅ Notify the highest bidder about the auction result
    const notification = new Notification({
      user: auction.highestBidder._id, // Winner ID
      message: `Congratulations! You won the auction for '${auction.product.name}'. Please proceed with the transaction.`,
      status: "unread",
    });

    await notification.save();

    res.json({ message: "Auction processed successfully!" });
  } catch (error) {
    console.error("❌ Error processing auction:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports.getAuctionResults = async (req, res) => {
  try {
    const results = await ResultAuction.find()
      .populate('product')
      .populate('highestBid.bidder'); // Populate winner details

    if (!results.length) {
      return res.json([]);
    }

    const formattedResults = results.map(result => ({
      _id: result._id,
      winnerName: result.highestBid.bidder.name,
      productName: result.product.name,
      winningBid: result.highestBid.bidAmount,
      status: result.auctionEnded ? "Pending Approval" : "Approved"
    }));

    res.json(formattedResults);
  } catch (error) {
    console.error('Error fetching auction results:', error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports.approveAuctionResult = async (req, res) => {
  const { resultId } = req.body;

  try {
    const resultAuction = await ResultAuction.findById(resultId).populate("highestBid.bidder").populate("product");

    if (!resultAuction) {
      return res.status(404).json({ message: "Auction result not found" });
    }

    if (resultAuction.auctionEnded) {
      return res.status(400).json({ message: "Auction already approved." });
    }

    // Update the result status to 'Approved'
    resultAuction.auctionEnded = true;
    await resultAuction.save();

    // Notify the winner
    const notification = new Notification({
      user: resultAuction.highestBid.bidder._id, // Buyer ID
      message: `Congratulations! Your auction bid for '${resultAuction.product.name}' has been approved. Please coordinate with the seller for payment.`,
      status: "unread",
    });

    await notification.save();

    res.json({ message: "Auction result approved successfully!" });
  } catch (error) {
    console.error("Error approving auction result:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

module.exports.getbuyers = async (req, res) => {
  try {
      const products = await Product.find({ seller: req.user._id }).lean();

      for (let product of products) {
          // Fetch buyers from orders (Retail Purchase)
          const orders = await Order.find({ product: product._id, status: 'approved' })
              .populate('buyer', 'firstName lastName')
              .lean();
          product.buyers = orders.map(order => ({
              name: `${order.buyer.firstName} ${order.buyer.lastName}`
          }));

          // Fetch auction participants (Wholesale Purchase)
          const participants = await AuctionParticipation.find({ product: product._id })
              .populate('buyer', 'firstName lastName')
              .lean();
          product.participants = participants.map(participant => ({
              name: `${participant.buyer.firstName} ${participant.buyer.lastName}`
          }));
      }

      res.render('farmer/index', { products });
  } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
  }
=======
>>>>>>> c42aa9918de99db9345067f94708590f6dedf2ff
};
