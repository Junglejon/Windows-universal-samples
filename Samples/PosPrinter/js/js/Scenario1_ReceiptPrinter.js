﻿//*********************************************************
//
// Copyright (c) Microsoft. All rights reserved.
// This code is licensed under the MIT License (MIT).
// THIS CODE IS PROVIDED *AS IS* WITHOUT WARRANTY OF
// ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING ANY
// IMPLIED WARRANTIES OF FITNESS FOR A PARTICULAR
// PURPOSE, MERCHANTABILITY, OR NON-INFRINGEMENT.
//
//*********************************************************

(function () {
    "use strict";
    var page = WinJS.UI.Pages.define("/html/Scenario1_ReceiptPrinter.html", {

        ready: function (element, options) {

            WinJS.log("Find and claim the printer to begin.", "sample", "status");

            document.getElementById("findClaimEnableButton").disabled = false;
            document.getElementById("printLineButton").disabled = true;
            document.getElementById("printReceiptButton").disabled = true;
            document.getElementById("scenarioEndButton").disabled = true;

            document.getElementById("findClaimEnableButton").addEventListener("click", findClaimEnable, false);
            document.getElementById("scenarioEndButton").addEventListener("click", endScenario, false);
            document.getElementById("printLineButton").addEventListener("click", printLine, false);
            document.getElementById("printReceiptButton").addEventListener("click", printReceipt, false);
        },

        unload: function () {
            if (_claimedPrinter !== null) {
                _claimedPrinter.close();
                _claimedPrinter = null;
            }

            if (_printer !== null) {
                _printer.close();
                _printer = null;
            }
        }
    });

    var _printer = null;
    var _claimedPrinter = null;
    var _isImportantTransaction = true;

    //
    //Creates multiple tasks, first to find a receipt printer, then to claim the printer and then to enable and add releasedevicerequested event handler.
    //
    function findClaimEnable() {

        WinJS.log("Finding printer...", "sample", "status");

        if (_printer == null) {

            SdkSample.getFirstReceiptPrinterAsync().then(function (printer) {

                if (printer != null) {
                    _printer = printer;

                    //Claim
                    _printer.claimPrinterAsync().done(function (claimedPrinter) {

                        if (claimedPrinter !== null) {

                            _claimedPrinter = claimedPrinter;

                            //Enable printer
                            _claimedPrinter.enableAsync().done(function (success) {

                                if (success) {
                                    WinJS.log("Enabled printer. Device ID: " + _claimedPrinter.deviceId, "sample", "status");

                                    document.getElementById("findClaimEnableButton").disabled = true;
                                    document.getElementById("printLineButton").disabled = false;
                                    document.getElementById("printReceiptButton").disabled = false;
                                    document.getElementById("scenarioEndButton").disabled = false;
                                }
                                else {
                                    WinJS.log("Could not enable printer.", "sample", "error");
                                }
                            });
                        } else {
                            WinJS.log("Could not claim the printer.", "sample", "error");
                        }
                    });
                } else {
                    WinJS.log("No printer found", "sample", "error");
                }
            });
        }
    }

    function endScenario() {

        if (_claimedPrinter !== null) {
            _claimedPrinter.close();
            _claimedPrinter = null;
        }

        if (_printer !== null) {
            _printer.close();
            _printer = null;
        }

        WinJS.log("Scenario ended.", "sample", "status");

        document.getElementById("findClaimEnableButton").disabled = false;
        document.getElementById("printLineButton").disabled = true;
        document.getElementById("printReceiptButton").disabled = true;
        document.getElementById("scenarioEndButton").disabled = true;
    }

    //
    //Prints the line that is in the textbox.
    //
    function printLine() {

        if (_claimedPrinter == null) {
            WinJS.log("Claimed printer instance is null. Cannot print.", "sample", "error");
        }
        else {

            var job = _claimedPrinter.receipt.createJob();
            job.printLine(document.getElementById("txtPrintLine").value);

            job.executeAsync().done(function () {
                WinJS.log("Printed line.", "sample", "status");
            }
            , function error(e) {
                WinJS.log("Was not able to print line: " + e.message, "sample", "error");
            }
            );
        }
    }

    //
    //Prints a sample receipt.
    //
    function printReceipt() {

        if (_claimedPrinter == null) {
            WinJS.log("Claimed printer instance is null. Cannot print.", "sample", "error");
        }
        else {
            var job = _claimedPrinter.receipt.createJob();
            job.printLine("======================");
            job.printLine("|   Sample Header    |");
            job.printLine("======================");

            job.printLine("Item             Price");
            job.printLine("----------------------");

            job.printLine("Books            10.40");
            job.printLine("Games             9.60");
            job.printLine("----------------------");
            job.printLine("Total----------- 20.00");

            job.printLine();
            job.printLine("______________________");
            job.printLine("Tip");
            job.printLine();
            job.printLine("______________________");
            job.printLine("Signature");
            job.printLine();
            job.printLine("Merchant Copy");
            lineFeedAndCutPaper(job);


            job.executeAsync().done(function () {
                WinJS.log("Printed receipt.", "sample", "status");
            }, function error(e) {
                WinJS.log("Was not able to print receipt: " + e.message, "sample", "error");
            });
        }
    }

    // Cut the paper after printing enough blank lines to clear the paper cutter.
    function lineFeedAndCutPaper(job) {

        if (_printer == null) {
            WinJS.log("No printers found. Cannot print.", "sample", "error");
        }
        else if (_claimedPrinter == null) {
            WinJS.log("Claimed printer instance is null. Cannot print.", "sample", "error");
        }
        else {
            for (var n = 0; n < _claimedPrinter.receipt.linesToPaperCut; n++) {
                job.printLine();
            }
            if (_printer.capabilities.receipt.canCutPaper) {
                job.cutPaper();
            }
        }
    }
})();
