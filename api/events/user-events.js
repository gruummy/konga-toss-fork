'use strict';

var events = require('events');
var eventEmitter = new events.EventEmitter();
var nodemailer = require('nodemailer');
// var mg = require('nodemailer-mailgun-transport'); // DISABLED - see under-review/mailgun/
var sendmail = require('sendmail')({
    logger: {
        debug: sails.log,
        info: console.info,
        warn: console.warn,
        error: console.error
    },
    silent: false
});


module.exports = {
    emit : function(event,data) {
        eventEmitter.emit(event,data)
    },

    addListener : function(event,fn) {
        eventEmitter.addListener(event, fn);
    },

    createTransporter : function(cb) {

        // Get active transport
        sails.models.settings.find().limit(1)
            .exec(function(err,settings){
                if(err) return cb(err)
                sails.log("helath_checks:createTransporter:settings =>",settings)
                if(!settings.length || !settings[0].data ) return cb()

                sails.models.emailtransport.findOne({
                    name : settings[0].data.default_transport
                }).exec(function(err,transport){
                    if(err) return cb(err)

                    sails.log("user-events:createTransporter:transport =>",transport)
                    if(!transport) return cb()

                    var result = {
                        settings : settings[0].data,
                    }

                    // Guard against disabled transports
                    if (settings[0].data.default_transport === 'mailgun') {
                        sails.log.error('============================================================');
                        sails.log.error('ERROR: Email transport "mailgun" is currently DISABLED');
                        sails.log.error('============================================================');
                        sails.log.error('Reason: Security vulnerabilities in nodemailer-mailgun-transport');
                        sails.log.error('');
                        sails.log.error('Supported transports:');
                        sails.log.error('  - smtp (recommended)');
                        sails.log.error('  - sendmail');
                        sails.log.error('');
                        sails.log.error('For more information see: under-review/mailgun/README.md');
                        sails.log.error('To use Mailgun via SMTP: Configure SMTP transport with Mailgun credentials');
                        sails.log.error('============================================================');
                        return cb(new Error('Email transport "mailgun" is disabled. Use smtp or sendmail.'));
                    }

                    switch(settings[0].data.default_transport) {
                        case "smtp":
                            result.transporter = nodemailer.createTransport(transport.settings)
                            break;
                        // case "mailgun": // DISABLED - see under-review/mailgun/
                        //     result.transporter = nodemailer.createTransport(mg(transport.settings))
                        //     break;
                    }

                    return cb(null,result);

                })
            })

    },

    notify : function(user, req) {

        var self = this

        self.createTransporter(function(err,result){
            if(err || !result) {
                sails.log("user-events:failed to create transporter. No notification will be sent.",err)
            }else{
                var transporter = result.transporter
                var settings = result.settings

                if(!err) {

                    var baseUrl = settings.basePath || (req.protocol || 'http') + "://" + (req.get('host') || (require("ip").address() + ':' + sails.config.port));

                    var link = baseUrl +  '/auth/activate/' + user.activationToken;

                    var mailOptions = {
                        from: '"' + settings.email_default_sender_name + '" <' + settings.email_default_sender + '>', // sender address
                        to: user.email, // list of receivers
                        subject: 'Welcome to Konga', // Subject line
                        html: '<h2>Welcome to Konga!</h2>' +
                        '<p>In order to activate your account, follow the link:</p>' +
                        '<p><a href="' + link + '">' + link + '</a></p>'
                    };

                    if(settings.default_transport == 'sendmail') {
                        sendmail(mailOptions, function(err, reply) {
                            if(err){
                                sails.log.error("user-events:notify:error",err)
                            }
                        });
                    }else{
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                sails.log.error("user-events:notify:error",error)
                            }
                        });
                    }
                }
            }
        })
    }
}
