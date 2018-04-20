/**
 * @author:    Index Exchange
 * @license:   UNLICENSED
 *
 * @copyright: Copyright (C) 2017 by Index Exchange. All rights reserved.
 *
 * The information contained within this document is confidential, copyrighted
 *  and or a trade secret. No part of this document may be reproduced or
 * distributed in any form or by any means, in whole or in part, without the
 * prior written permission of Index Exchange.
 */
// jshint ignore: start

'use strict';

/* =====================================
 * Utilities
 * ---------------------------------- */

/**
 * Returns an array of parcels based on all of the xSlot/htSlot combinations defined
 * in the partnerConfig (simulates a session in which all of them were requested).
 *
 * @param {object} profile
 * @param {object} partnerConfig
 * @returns []
 */
function generateReturnParcels(profile, partnerConfig) {
    var returnParcels = [];

    for (var htSlotName in partnerConfig.mapping) {
        if (partnerConfig.mapping.hasOwnProperty(htSlotName)) {
            var xSlotsArray = partnerConfig.mapping[htSlotName];
            for (var i = 0; i < xSlotsArray.length; i++) {
                var xSlotName = xSlotsArray[i];
                returnParcels.push({
                    partnerId: profile.partnerId,
                    htSlot: {
                        getId: function () {
                            return htSlotName
                        }
                    },
                    ref: "",
                    xSlotRef: partnerConfig.xSlots[xSlotName],
                    requestId: '_' + Date.now()
                });
            }
        }
    }

    return returnParcels;
}

/* =====================================
 * Testing
 * ---------------------------------- */

describe('generateRequestObj', function () {

    /* Setup and Library Stub
     * ------------------------------------------------------------- */
    var inspector = require('schema-inspector');
    var proxyquire = require('proxyquire').noCallThru();
    var libraryStubData = require('./support/libraryStubData.js');
    var partnerModule = proxyquire('../triple-lift-htb.js', libraryStubData);
    var partnerConfigs = require('./support/mockPartnerConfig.json');
    var expect = require('chai').expect;
    /* -------------------------------------------------------------------- */

    /* Partner instances */
    var partnerInstance;
    var partnerProfile;

    /* Generate dummy return parcels based on MRA partner profile */
    var returnParcels;
    var requestObject;

    describe('should return a correctly formated object', function () {

        /* Instatiate your partner module */
        partnerInstance = partnerModule(partnerConfigs);
        partnerProfile = partnerInstance.__profile;

        /* Generate a request object using generated mock return parcels. */
        returnParcels = generateReturnParcels(partnerProfile, partnerConfigs);

        for (var i = 0; i < returnParcels.length; i++) {
            requestObject = partnerInstance.__generateRequestObj([returnParcels[i]]);

            /* Simple type checking, should always pass */
            it('should contain the correct properties', function () {
                var result = inspector.validate({
                    type: 'object',
                    strict: true,
                    properties: {
                        url: {
                            type: 'string',
                            minLength: 1
                        },
                        data: {
                            type: 'object',
                            strict: true,
                            properties: {
                                inv_code: {
                                    type: 'string'
                                },
                                lib: {
                                    type: 'string',
                                    eq: 'ix'
                                },
                                fe: {
                                    type: 'number',
                                    eq: [0,1]
                                },
                                size: {
                                    type: 'string'
                                },
                                referrer: {
                                    type: 'string'
                                }
                            }
                        }
                    }
                }, requestObject);

                expect(result.valid).to.be.true;
            });
        }
    });

    /* Test that the generateRequestObj function creates the correct object by building a URL
     * from the results. This is the bid request url that wrapper will send out to get demand
     * for your module.
     *
     * The url should contain all the necessary parameters for all of the request parcels
     * passed into the function.
     */

    describe('should correctly build the endpoint url', function () {
        var url, i, match;

        it('should correctly set the base url', function () {
            /* Instatiate your partner module */
            partnerInstance = partnerModule(partnerConfigs);
            partnerProfile = partnerInstance.__profile;

            /* Generate a request object using generated mock return parcels. */
            returnParcels = generateReturnParcels(partnerProfile, partnerConfigs);

            for (i = 0; i < returnParcels.length; i++) {
                requestObject = partnerInstance.__generateRequestObj([returnParcels[i]]);
                url = requestObject.url;
                expect(url, "incorrect base url").to.equal(partnerInstance.__baseUrl);
            }
        })

        it('should correctly set inv_code request paramater', function () {
            /* Instatiate your partner module */
            partnerInstance = partnerModule(partnerConfigs);
            partnerProfile = partnerInstance.__profile;

            /* Generate a request object using generated mock return parcels. */
            returnParcels = generateReturnParcels(partnerProfile, partnerConfigs);

            for (i = 0; i < returnParcels.length; i++) {
                requestObject = partnerInstance.__generateRequestObj([returnParcels[i]]);
                expect(requestObject.data.inv_code, "inv_code is incorrect or not present").to.equal(returnParcels[i].xSlotRef.inventoryCode);
            }
        })

        it('should correctly set lib request paramater', function () {
            /* Instatiate your partner module */
            partnerInstance = partnerModule(partnerConfigs);
            partnerProfile = partnerInstance.__profile;

            /* Generate a request object using generated mock return parcels. */
            returnParcels = generateReturnParcels(partnerProfile, partnerConfigs);

            for (i = 0; i < returnParcels.length; i++) {
                requestObject = partnerInstance.__generateRequestObj([returnParcels[i]]);
                expect(requestObject.data.lib, "lib is incorrect or not present").to.equal('ix');
            }
        })

        it('should correctly set fe request paramater', function () {
            /* Instatiate your partner module */
            partnerInstance = partnerModule(partnerConfigs);
            partnerProfile = partnerInstance.__profile;

            /* Generate a request object using generated mock return parcels. */
            returnParcels = generateReturnParcels(partnerProfile, partnerConfigs);

            for (i = 0; i < returnParcels.length; i++) {
                requestObject = partnerInstance.__generateRequestObj([returnParcels[i]]);
                expect(requestObject.data.fe, "fe is incorrect or not present").to.be.a('number');
            }
        })
        /* ---------- ADD MORE TEST CASES TO TEST CASES FOR EVERY NEW CHANGE/FEATURE ------------*/

    });
    /* -----------------------------------------------------------------------*/
});