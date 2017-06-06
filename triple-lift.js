/**
 * File Information
 * =============================================================================
 * @overview  TripleLift Module
 * @version   1.0.0
 * @author    TripleLift
 * -----------------------------------------------------------------------------
 */

window.headertag.partnerScopes.push(function() {
    'use strict';

    /* =============================================================================
     * SECTION A | Configure Module Name and Feature Support
     * -----------------------------------------------------------------------------
     *
     * Configure all of the following settings for this module.
     *
     * PARTNER_ID:
     *     Three or four character partner ID provided by Index Exchange.
     *
     * SUPPORTED_TARGETING_TYPES:
     *     The types of targeting that are supported by this module.
     *
     *          - page: targeting is set on the page as a whole.
     *          - slot: targeting is set on each slot individually.
     *
     * SUPPORTED_ANALYTICS:
     *     The types of analytics the wrapper should support for this module.
     *
     *          - time:   time between when this module's getDemand function is
     *                    called, and when it returns its retrieved demand.
     *          - demand: the targeting information returned from this module.
     *
     * SUPPORTED_OPTIONS:
     *     Other features that are supported by this module.
     *
     *          - prefetch:     If true, indicates that this module supports the
     *                          retrieval of demand on page load through the
     *                          prefetchDemand interface.
     *          - demandExpiry: If set, indicates that demand retrieved and stored
     *                          (as with the case of prefetched demand) should not
     *                          be used after a set duration. A value less than 0
     *                          indicates that demandExpiry is disabled.
     */

    var PARTNER_ID = 'TPL';

    var SUPPORTED_TARGETING_TYPES = {
        page: false,
        slot: true
    };

    var SUPPORTED_ANALYTICS = {
        time: true,
        demand: true
    };

    var SUPPORTED_OPTIONS = {
        prefetch: false,
        demandExpiry: -1
    };

    /* -------------------------------------------------------------------------- */

    var prefetchState = {
        NEW: 1,
        IN_PROGRESS: 2,
        READY: 3,
        USED: 4
    };

    var Utils = window.headertag.Utils;
    var Network = window.headertag.Network;
    var BidRoundingTransformer = window.headertag.BidRoundingTransformer;

    function validateTargetingType(tt) {
        return typeof tt === 'string' && SUPPORTED_TARGETING_TYPES[tt];
    }

    function init(config, callback) {
        //? if (DEBUG) {
        var err = [];

        if (!config.hasOwnProperty('targetingType') || !validateTargetingType(config.targetingType)) {
            err.push('targetingType either not provided or invalid.');
        }

        /* =============================================================================
         * SECTION B | Validate Module-Specific Configurations
         * -----------------------------------------------------------------------------
         *
         * Validate all the module-specific parameters in the `config` object.
         * Validation functions have been provided in the `Utils` object for
         * convenience. See ../lib/utils.js for more information.
         *
         * For required configurations use:
         *
         *     if (!config.hasOwnProperty(<parameter>) || ... || ...) {
         *         err.push(<error message>);
         *     }
         *
         * For optional configurations use:
         *
         *     if (config.hasOwnProperty(<parameters>)  && (... || ...)) {
         *         err.push(<error message>);
         *     }
         *
         */

        /* PUT CODE HERE */

        /* -------------------------------------------------------------------------- */

        var xSlotConfigValid = true;

        if (!config.hasOwnProperty('xSlots') || typeof config.xSlots !== 'object' || Utils.isArray(config.xSlots)) {
            err.push('xSlots either not provided or invalid.');
            xSlotConfigValid = false;
        } else {
            for (var xSlotName in config.xSlots) {
                if (!config.xSlots.hasOwnProperty(xSlotName)) {
                    continue;
                }

        /* =============================================================================
         * SECTION C | Validate Partner Slot Configurations
         * -----------------------------------------------------------------------------
         *
         * Validate the specific configurations that must appear in each xSlot.
         * Validation functions have been provided in the `Utils` object for
         * convenience. See ../lib/utils.js for more information.
         *
         * For required configurations use:
         *
         *     if (!config.hasOwnProperty(<parameter>) || ... || ...) {
         *         err.push(<error message>);
         *     }
         *
         * For optional configurations use:
         *
         *     if (config.hasOwnProperty(<parameters>)  && (... || ...)) {
         *         err.push(<error message>);
         *     }
         *
         */

        /* PUT CODE HERE */
                if (!config.xSlots[xSlotName].hasOwnProperty('inventoryCode')) {
                    err.push('inventoryCode not provided for xSlot ' + xSlotName);
                }
                if (!config.xSlots[xSlotName].hasOwnProperty('sizes')) {
                    err.push('sizes not provided for xSlot ' + xSlotName);
                }

        /* -------------------------------------------------------------------------- */

            }
        }

        if (!config.hasOwnProperty('mapping') || typeof config.xSlots !== 'object' || Utils.isArray(config.xSlots)) {
            err.push('mapping either not provided or invalid.');
        } else {
            var seenXSlots = {};

            for (var htSlotName in config.mapping) {
                if (!config.mapping.hasOwnProperty(htSlotName)) {
                    continue;
                }

                var htSlotMapping = config.mapping[htSlotName];

                if (!Utils.isArray(htSlotMapping) || !htSlotMapping.length) {
                    err.push('slot mappings missing or invalid for htSlot ' + htSlotName);
                } else {
                    for (var k = 0; k < htSlotMapping.length; k++) {
                        if (!Utils.validateNonEmptyString(htSlotMapping[k])) {
                            err.push('slot mappings missing or invalid for htSlot ' + htSlotName);
                        } else if (xSlotConfigValid) {
                            if (config.xSlots.hasOwnProperty(htSlotMapping[k])) {
                                if (seenXSlots.hasOwnProperty(htSlotMapping[k])) {
                                    err.push('xSlot ' + htSlotMapping[k] + ' mapped multiple times in ' + PARTNER_ID +' config');
                                } else {
                                    seenXSlots[htSlotMapping[k]] = true;
                                }
                            } else {
                                err.push('invalid xSlot ' + htSlotMapping[k] + ' in mapping for htSlot ' + htSlotName);
                            }
                        }
                    }
                }
            }
        }

        if (config.hasOwnProperty('targetKeyOverride')) {
            if (!Utils.validateNonEmptyObject(config.targetKeyOverride)) {
                err.push('targetKeyOverride must be a non-empty object');
            } else {
                if (config.targetKeyOverride.omKey && !Utils.validateNonEmptyString(config.targetKeyOverride.omKey)) {
                    err.push('targetKeyOverride.omKey must be a non-empty string');
                }

                if (config.targetKeyOverride.pmKey && !Utils.validateNonEmptyString(config.targetKeyOverride.pmKey)) {
                    err.push('targetKeyOverride.pmKey must be a non-empty string');
                }

                if (config.targetKeyOverride.idKey && !Utils.validateNonEmptyString(config.targetKeyOverride.idKey)) {
                    err.push('targetKeyOverride.idKey must be a non-empty string');
                }
            }
        }

        if (config.hasOwnProperty('roundingBuckets')) {
            if (!Utils.validateNonEmptyObject(config.roundingBuckets)) {
                err.push('roundingBuckets must be a non-empty object');
            } else {
                var rConf = config.roundingBuckets;
                if (rConf.floor && (typeof rConf.floor !== 'number' || rConf.floor < 0)) {
                    err.push('roundingBuckets.floor must be a non-negative number');
                }
                if (rConf.inputCentsMultiplier && (typeof rConf.inputCentsMultiplier !== 'number' || rConf.inputCentsMultiplier < 0)) {
                    err.push('roundingBuckets.floor must be a non-negative number');
                }
                if (rConf.outputCentsDivisor && (typeof rConf.outputCentsDivisor !== 'number' || rConf.outputCentsDivisor < 0)) {
                    err.push('roundingBuckets.floor must be a non-negative number');
                }
                if (rConf.outputPrecision && !Utils.validateInteger(rConf.outputPrecision)) {
                    err.push('roundingBuckets.outputPrecision must be an integer');
                }
                if (rConf.roundingType && !Utils.validateInteger(rConf.roundingType, 0, 3)) {
                    err.push('roundingBuckets.roundingType must be a valid rounding type');
                }
                if (rConf.buckets && (!Utils.isArray(rConf.buckets) || rConf.buckets.length === 0)) {
                    err.push('roundingBuckets.buckets must be an array');
                } else {
                    for (var l = 0; l < rConf.buckets.length; l++) {
                        if (!Utils.validateNonEmptyObject(rConf.buckets[l])) {
                            err.push('roundingBuckets.buckets must contain non-empty objects');
                            break;
                        }
                    }
                }
            }
        }

        if (err.length) {
            callback(err);
            return;
        }

        //? }

        var tplBidder = new Partner(config);

        try {
            window.headertag[PARTNER_ID] = {};
            window.headertag[PARTNER_ID].callback = tplBidder.responseCallback;
            window.headertag.TripleLiftHtb = {};
            window.headertag.TripleLiftHtb.render = tplBidder.renderAd;
        } catch(e) {
            console.log("Error: " + e);
        }

        callback(null, tplBidder);
    }

    function Partner(config) {
        var _this = this;

        var targetingType = config.targetingType;
        var supportedAnalytics = SUPPORTED_ANALYTICS;
        var supportedOptions = SUPPORTED_OPTIONS;

        var prefetch = {
            state: prefetchState.NEW,
            correlator: null,
            gCorrelator: null,
            slotIds: [],
            callbacks: []
        };

        var demandStore = {};
        var creativeStore = {};
        var demandObj = {
            slot : {}
        };

        /* =============================================================================
         * Set default targeting keys to be used for DFP. Values for omKey and idKey are
         * mandatory. pmKey is only necessary if the partner will use a private market
         * (deals).
         *
         * Standard values are:
         *
         * omKey: ix_(PARTNER ID)_om
         * pmKey: ix_(PARTNER ID)_pm
         * idKey: ix_(PARTNER ID)_id
         */

        var omKey = 'ix_tpl_cpm',
            pmKey = 'ix_tpl_cpm',
            pmidKey = 'ix_tpl_dealid',
            idKey = 'ix_tpl_id';

        var targetingKeys = {
            omKey: omKey,
            pmKey: pmKey,
            idKey: idKey,
            pmidKey: pmidKey
        };

        if (config.targetKeyOverride) {
            if (config.targetKeyOverride.omKey) {
                targetingKeys.omKey = config.targetKeyOverride.omKey;
            }

            if (config.targetKeyOverride.pmKey) {
                targetingKeys.pmKey = config.targetKeyOverride.pmKey;
            }

            if (config.targetKeyOverride.idKey) {
                targetingKeys.idKey = config.targetKeyOverride.idKey;
            }

            if (config.targetKeyOverride.pmidKey) {
                targetingKeys.pmidKey = config.targetKeyOverride.pmidKey;
            }
        }

        var bidTransformer;

        /* =============================================================================
         * Set the default parameters for interpreting the prices sent by the bidder
         * endpoint. The bid transformer library uses cents internally, so this object
         * specifies how to transform to and from the units provided by the bidder
         * endpoint and expected by the DFP line item targeting. See
         * bid-rounding-transformer.js for more information.
         */
        var bidTransformConfig = {          // Default rounding configuration
            "floor": 0,                     // Minimum acceptable bid price
            "inputCentsMultiplier": 100,    // Multiply input bids by this to get cents
            "outputCentsDivisor": 1,        // Divide output bids in cents by this
            "outputPrecision": 0,           // Decimal places in output
            "roundingType": 1,              // Rounding method (1 is floor)
            "buckets": [{                   // Buckets specifying rounding steps
                "max": 2000,                // Maximum number of cents for this bucket
                "step": 5                   // Increments for this bucket in cents
            }, {
                "max": 5000,                // Maximum number of cents for this bucket
                "step": 100                 // Increments for this bucket in cents
            }]
        };

        if (config.roundingBuckets) {
            bidTransformConfig = config.roundingBuckets;
        }

        /* =============================================================================
         * Use the bidTransformer object to round bids received from the partner
         * endpoint. Usage:
         *
         * var roundedBid = bidTransformer.transformBid(rawBid);
         */
        bidTransformer = BidRoundingTransformer(bidTransformConfig);

        /* =============================================================================
         * SECTION E | Copy over the Configurations to Internal Variables
         * -----------------------------------------------------------------------------
         *
         * Assign all the required values from the `config` object to internal
         * variables. These values do not need to be validated here as they have already
         * been validated in `init`.
         *
         * Example:
         *
         *      var <internal parameter> = config.<corresponding parameter>;
         */

        /* PUT CODE HERE */

        var xSlots = config.xSlots;
        var mapping = config.mapping;

        /* -------------------------------------------------------------------------- */

        this.getPartnerTargetingType = function getPartnerTargetingType() {
            return targetingType;
        };

        this.getSupportedAnalytics = function getSupportedAnalytics() {
            return supportedAnalytics;
        };

        this.getSupportedOptions = function getSupportedOptions() {
            return supportedOptions;
        };

        this.getPartnerDemandExpiry = function getPartnerDemandExpiry() {
            return supportedOptions.demandExpiry;
        };

        this.setPartnerTargetingType = function setPartnerTargetingType(tt) {
            if (!validateTargetingType(tt)) {
                return false;
            }

            targetingType = tt;

            return true;
        };

        this.prefetchDemand = function prefetchDemand(correlator, info, analyticsCallback) {
            prefetch.state = prefetchState.IN_PROGRESS;
            prefetch.correlator = correlator;
            prefetch.slotIds = info.divIds.slice(); // ['htSlotID-1', 'htSlotID-2']

            /* =============================================================================
             * SECTION F | Prefetch Demand from the Module's Ad Server
             * -----------------------------------------------------------------------------
             *
             * The `info` argument is an object containing all the information required by
             * this module to prefetch demand.
             *
             * prefetch.slotIds will be an array of htSlotIds. Use these to look up the
             * slots to prefetch from the keys of the mapping object in the configs.
             *
             * Make a request to the module's ad server to get demand. If there is an error
             * simply run the code block in 'STEP 06'. If there are no errors, put the
             * retrieved demand in `demandStore[correlator]`.
             *
             * The demand must be in the following format:
             *
             *     {
             *         slot: {
             *             <htSlotId>: {
             *                 timestamp: Utils.now(),
             *                 demand: {
             *                     <key>: <value>,
             *                     <key>: <value>,
             *                     ...
             *                 }
             *             },
             *             ...
             *         }
             *     }
             */

            /* PUT CODE HERE */

            /* -------------------------------------------------------------------------- */

            /* =============================================================================
             * SECTION G | End Prefetch
             * -----------------------------------------------------------------------------
             *
             * Ensure this section happens after the demand has been prefetched or an error
             * has occurred. This may mean putting it in a callback function.
             */

            prefetch.state = prefetchState.READY;

            analyticsCallback(correlator);

            for (var x = 0, lenx = prefetch.callbacks.length; x < lenx; x++) {
                setTimeout(prefetch.callbacks[x], 0);
            }

            /* -------------------------------------------------------------------------- */
        };

        this.getDemand = function getDemand(correlator, slots, callback) {
            if (prefetch.state === prefetchState.IN_PROGRESS) {
                var currentDivIds = Utils.getDivIds(slots);
                var prefetchInProgress = false;

                for (var x = 0, lenx = currentDivIds.length; x < lenx; x++) {
                    var slotIdIndex = prefetch.slotIds.indexOf(currentDivIds[x]);

                    if (slotIdIndex !== -1) {
                        prefetch.slotIds.splice(slotIdIndex, 1);
                        prefetchInProgress = true;
                    }
                }

                if (prefetchInProgress) {
                    prefetch.callbacks.push(getDemand.bind(_this, correlator, slots, callback));
                    return;
                }
            }

            var demand = {
                slot: {}
            };

            if (prefetch.state === prefetchState.READY) {
                for (var i = slots.length - 1; i >= 0; i--) {
                    var divId = slots[i].getSlotElementId();

                    if (demandStore[prefetch.correlator].slot.hasOwnProperty(divId)) {
                        if (supportedOptions.demandExpiry < 0 || (Utils.now() - demandStore[prefetch.correlator].slot[divId].timestamp) <= supportedOptions.demandExpiry) {
                            demand.slot[divId] = demandStore[prefetch.correlator].slot[divId];
                            slots.splice(i, 1);
                        }

                        delete demandStore[prefetch.correlator].slot[divId];
                    }
                }

                if (!Utils.validateNonEmptyObject(demandStore[prefetch.correlator].slot)) {
                    prefetch.state = prefetchState.USED;
                }

                if (!slots.length) {
                    callback(null, demand);
                    return;
                }
            }

            /* =============================================================================
             * SECTION H | Return Demand from the Module's Ad Server
             * -----------------------------------------------------------------------------
             *
             * The `slots` argument is an array of HeaderTagSlot objects for which demand
             * is requested. Call the getSlotElementId function on these objects to obtain
             * their IDs to look up in the mapping object of the config.
             *
             * Make a request to the module's ad server to get demand. If there is an error
             * while doing so, then call `callback` as such:
             *
             *      callback(err);
             *
             * where `err` is a descriptive error message.
             *
             * If there are no errors, and demand is returned from the ad servers, call
             * `callback` as such:
             *
             *      callback(null, demand);
             *
             * where `demand` is an object containing the slot-level demand in the following
             * format:
             *
             *     {
             *         slot: {
             *             <htSlotId>: {
             *                 timestamp: Utils.now(),
             *                 demand: {
             *                     <key>: <value>,
             *                     <key>: <value>,
             *                     ...
             *                 }
             *             },
             *             ...
             *         }
             *     }
             */

            /* PUT CODE HERE */

            // map slots to TripleLift xSlots and make request for each placement
            var htSlot2xSlot = {};
            // go through each htSlot (`slots`) passed in `getDemand`
            slots.forEach(function(slot) {
                var slotId = slot.getSlotElementId();
                // collect IDs of active htSlot. check whether an xSlot is mapped in `mapping`
                if(mapping.hasOwnProperty(slotId)) {
                    mapping[slotId].forEach(function(xSlotId) {
                        // if mapped xSlotId is in the xSlots object, acquire demand for the placement
                        if (xSlots.hasOwnProperty(xSlotId)) {
                            htSlot2xSlot[slotId] = xSlots[xSlotId];
                        }
                    })
                }

            });

            var numPlacements = Object.keys(htSlot2xSlot).length;
            if (numPlacements == 0) {
                // short-circuit if no eligible slots
                callback(null);
            } else {
                // callback passed to makeRequest function to be called upon success/failure
                makeRequest(htSlot2xSlot, numPlacements, callback);
            }

            /* -------------------------------------------------------------------------- */
        };

        this.responseCallback = function(err, responseObj) {
            /* =============================================================================
             * SECTION I | Parse Demand from the Module's Ad Server
             * -----------------------------------------------------------------------------
             *
             * Run this function as a callback when the ad server responds with demand.
             * Store creatives and demand in global objects as needed for processing.
             */

            /* PUT CODE HERE */

            /* -------------------------------------------------------------------------- */
        };

        this.renderAd = function(doc, targetingMap, width, height) {
            /* =============================================================================
             * SECTION J | Render function
             * -----------------------------------------------------------------------------
             *
             * This function will be called by the DFP creative to render the ad. It should
             * work as-is, but additions may be necessary here if there beacons, tracking
             * pixels etc. that need to be called as well.
             */

            if (doc && targetingMap && width && height) {
                try {
                    var id = targetingMap[targetingKeys.idKey][0];
                    var ad = creativeStore[id][width + 'x' + height].ad;
                    doc.write(ad);
                    doc.close();
                    if (doc.defaultView && doc.defaultView.frameElement) {
                        doc.defaultView.frameElement.width = width;
                        doc.defaultView.frameElement.height = height;
                    }
                } catch (e) {
                    //? if (DEBUG)
                    console.log('Error trying to write ' + PARTNER_ID + ' ad to the page. Error: ' + e);
                }

            }
        };


        /* =============================================================================
             * TL Helpers | Private methods
             * -----------------------------------------------------------------------------
             *
             */


        // TODO: Clean this up (break up, redo scope, consider timing)
        function makeRequest(htSlot2xSlot, numPlacements, callback) {
            Object.keys(htSlot2xSlot).forEach(function(slot) {
                var htSlotId = slot;
                var xSlot = htSlot2xSlot[slot];
                window.headertag.Network.ajax({
                    url: buildTplCall(xSlot),
                    method: 'GET',
                    partnerId: PARTNER_ID,
                    withCredentials: true,
                    onSuccess: function(response) {
                        parseResponse(JSON.parse(response), htSlotId);
                    },
                    onFailure: function() {
                        callback('TPL: demand request failed');
                    }
                });
            });

            function parseResponse(response, htSlotId) {
                var slotDemand = {}
                var demandTargeting = {};

                if(!response.status) {
                    var responseSize = response.width + 'x' + response.height;
                    var creativeStoreId = response.callback_id;

                    creativeStore[creativeStoreId] = creativeStore[creativeStoreId] || {};
                    creativeStore[creativeStoreId][responseSize] = {};
                    creativeStore[creativeStoreId][responseSize].ad = response.ad;

                    demandTargeting[targetingKeys.idKey] = creativeStoreId;
                    if (response.deal_id) {
                        demandTargeting[targetingKeys.pmKey] = responseSize + "_" + bidTransformer.transformBid(response.cpm);
                        demandTargeting[targetingKeys.pmidKey] = response.deal_id;
                    }
                    else {
                        demandTargeting[targetingKeys.omKey] = responseSize + "_" + bidTransformer.transformBid(response.cpm);
                    }
                }

                slotDemand.timestamp = Utils.now();
                slotDemand.demand = demandTargeting;
                demandObj.slot[htSlotId] = slotDemand;

                // TODO: Add timeout to call the callback.
                if (Object.keys(demandObj.slot).length === numPlacements) {
                    callback(null, demandObj);
                }
            }
        }

        function buildTplCall(xSlot) {
            var baseUrl = document.location.protocol + '//tlx.3lift.net/header/auction?';
            var sizes = xSlot.sizes.map(function(size) {
                return size.join('x');
            }).join(',');

            var params = {
                callback_id: Math.floor(Math.random() * 1000) + 1,
                inv_code: xSlot.inventoryCode,
                lib: 'ix',
                fe: isFlashEnabled() ? 1 : 0,
                size: sizes,
                referrer: document.location.href
            };
            if (xSlot.floor) {
                params.floor = xSlot.floor;
            }
            return appendQueryParams(baseUrl, params);
        }

        function isFlashEnabled() {
            var hasFlash = false;
            try {
                // check for Flash support in IE
                if (new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash')) {
                    hasFlash = true;
                }
            } catch (e) {
                // check for Flash support in other browsers
                if (navigator.mimeTypes
                    && navigator.mimeTypes['application/x-shockwave-flash'] !== undefined
                    && navigator.mimeTypes['application/x-shockwave-flash'].enabledPlugin) {
                    hasFlash = true;
                }
            }
            return hasFlash;
        }

        function appendQueryParams(baseUrl, params) {
            var queryParams = Object.keys(params).map(function(key) {
                return key + '=' + encodeURIComponent(params[key]);
            }).join('&');
            return baseUrl + queryParams;
        };
    }

    window.headertag.registerPartner(PARTNER_ID, init);
});
