/*
 Copyright (c) Bright Peak Financial, Inc.   All Rights Reserved
 THIS IS PROPRIETARY SOURCE CODE OF Bright Peak Financial, Inc. (BPF)
 This source code may not be copied, reverse engineered, or altered for any purpose.
 This source code is to be used exclusively by approved users of Bright Peak Financial.
 */

(function () {
    var wrangler = {
        configuration: undefined,
        self: undefined,
        logger: undefined,

        init: function (aConfiguration) {
            self = this;
            self.configuration = aConfiguration;
        },
        execute: function (aTuplesInput, aSinkCallback) {
            production.logger.log('info', 'enter-wrangler', {
                production: production.name,
                wrangler: "AdjustTimestampFormat"
            });

            if (aTuplesInput)
                if (aTuplesInput.length > 0) {
                    for (tupleIndex = 0; tupleIndex < aTuplesInput.length; tupleIndex++) {
                        tuple = aTuplesInput[tupleIndex];
                        for (timestampsToAdjustIndex = 0; timestampsToAdjustIndex < wrangler.configuration.timestampsToAdjust.length; timestampsToAdjustIndex++) {
                            timestampAdjustment = wrangler.configuration.timestampsToAdjust[timestampsToAdjustIndex];
                            if (tuple[timestampAdjustment.sourceAttributeName]) {
                                nativeTimestamp = tuple[timestampAdjustment.sourceAttributeName];
                                if (nativeTimestamp) {
                                    date = new Date(nativeTimestamp)
                                    if (date)
                                        if (timestampAdjustment.format === 'ISO')
                                            tuple[timestampAdjustment.adjustedAttributeName] = date.toISOString();
                                        else if (timestampAdjustment.format === 'UTC')
                                            tuple[timestampAdjustment.adjustedAttributeName] = date.toUTCString();
                                        else if (timestampAdjustment.format === 'TIME')
                                            tuple[timestampAdjustment.adjustedAttributeName] = date.getTime();
                                }
                            }
                        }
                    }
                    production.logger.log('info', 'exit-wrangler', {
                        production: production.name,
                        wrangler: "AdjustTimestampFormat"
                    });
                    aSinkCallback(null, aTuplesInput)
                }
                else {
                    production.logger.log('error', 'exit-wrangler', {
                        production: production.name,
                        wrangler: "AdjustTimestampFormat",
                        reason: "empty tuple stream"
                    });
                    aSinkCallback('tupleStream is empty')
                }
            else {
                aSinkCallback('tupleStream is empty')
                production.logger.log('error', 'exit-wrangler', {
                    production: production.name,
                    wrangler: "AdjustTimestampFormat",
                    reason: "tuple stream is null"
                });
            }
        }
    }
    exports.module = wrangler;

})();