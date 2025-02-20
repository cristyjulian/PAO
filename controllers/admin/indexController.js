const User = require('../../models/user');
const Order = require('../../models/order');
const AuctionSession = require('../../models/auctionSession');
const moment = require('moment');
const SITE_TITLE = 'PAO';

module.exports.index = async (req, res) => {
    try {
        const userLogin = await User.findById(req.session.login);
        
        if (userLogin) {
            res.render('admin/index.ejs', {
                site_title: SITE_TITLE,
                title: 'Home',
                req: req,
                messages: req.flash(),
                userLogin: userLogin,
                currentUrl: req.originalUrl,
            });
        } else {
            req.flash('error', 'Please log in first.');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Error loading dashboard:', error);
        req.flash('error', 'Something went wrong.');
        res.redirect('/login');
    }
};