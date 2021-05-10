var globalJson;
var changeValuePositiveHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-up green" aria-hidden="true"></i>';
var changeValueNegativeHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-down red" aria-hidden="true"></i>';

function removeCommaAndK_Mvalues(val) {
   
    val = val.replace(/,/g, '');

    if (val.includes('K')) {
        val = val.replace('K', '');

        val = parseInt(val) * 1000;
    } else if (val.includes('M')) {
        val = val.replace('M', '');

        val = parseFloat(val) * 1000000;
    }

    return val;
}

function loadCategories(data) {
    globalJson = data;

    var sldpreHtml = '<div class="col-md-2 col-lg-2 p-0" style="margin-top: 2.8rem;">';
    var barpreHtml = '<div class="col-md-2 col-lg-2 p-0">';

    var categoryHtml = '<p class="scnripItem scnrcompipItem">$CATEGORY$</p>';
    var finalHtml = "";
    $.each(data, function (key, field) {
        sldpreHtml += categoryHtml.replace('$CATEGORY$', key);
        barpreHtml += categoryHtml.replace('$CATEGORY$', key);
    });
    sldpreHtml += '</div>';
    barpreHtml += '</div>';

    $("#scenariocompInputContainer").append(sldpreHtml);
    $("#scenariobarsContainer").append(barpreHtml);

    addScenario(1);
    addScenario(2);
    addScenario(3);


}

function addScenario(counter) {

    if (globalJson != undefined && globalJson != null) {
        var total = 0;
        $("#scenariocompInputContainer").append(getScenarioSlider(globalJson, counter));
        $("#scenariobarsContainer").append(getScenariobars(globalJson, counter));
        $.each(globalJson, function (key, field) {
            // if (key != "PR") {
            //     total += parseFloat(field);
            // }
            total += parseFloat(field);
        });
        $("#scenariovalueContainer").append(getScenarioresults(commaSeparateNumber(total), 0, counter));
    }
}

function getScenarioSlider(data, count) {

    var preHtml = '<form class="scenarioBox" name="scenariocompareinpt_form" id="scenario_Box_' + count + '">';

    var scenarioHtml = '<h5 class="scnrcompboxhdr">Scenario $COUNT$</h5><div class="card contntBoxTPbrdr">  <div class="card-body">';
    var htmlTemplate = '<div class="input-group scnripItem_optim"> <button type="button" class="btn btn-link px-1" id="INPUT_VALUE_minus" onClick="decrement_click(this.id)"> <i class="fa fa-minus-circle" aria-hidden="true"></i> </button><div barValue="BAR_VALUE" class="sgmntslider" id="INPUT_VALUE"></div><button type="button" class="btn btn-link px-1" id="INPUT_VALUE_plus" onClick="increment_click(this.id)"> <i class="fa fa-plus-circle" aria-hidden="true"></i> </button> <input class="form-control inputNumber" name="INPUT_VALUE" id="INPUT_VALUE_scnrprice" onchange="ipvalcheck(this.id)" type="numeric" value="0"> <span class="prcntdot"> <i class="fa fa-percent" aria-hidden="true"></i> </span></div>';
    scenarioHtml = scenarioHtml.replace("$COUNT$", count);
    preHtml += scenarioHtml;
    $.each(data, function (categoryKey, field) {

        categoryKey = categoryKey.replace(".", "");
        categoryKey = categoryKey.replace(" ", "");
        categoryKey = categoryKey.replace("_", "");

        preHtml += htmlTemplate.replace(/INPUT_VALUE/gi, categoryKey + "scenario_" + count).replace("BAR_VALUE", field);
    });
    preHtml += '</div></div></form>';
   
    return preHtml;
}


function getScenariobars(data, count) {

    var preHtml = '<div class="scenariobarBox">';
    var scenariobarHtml = '<div class="card">  <div class="card-body sldrboxcontainer">';
    var barTemplate = '<section class="chartwrapper"> <ul id="INPUT_VALUE" class="scnrsegmntchart progress_chart"> <li title="80" class="newscn pgrsnewscn" id=""> <span class="bar"></span> <span class="percent scenario_$COUNT1$"></span> </li><li title="INPUT_DATA" class="base pgrsbase" id=""> <span class="bar"></span> <span class="percent"></span> </li></ul> </section>';
 
    barTemplate = barTemplate.replace("$COUNT1$", count);
    preHtml += scenariobarHtml;
    $.each(data, function (categoryKey, field) {

        categoryKey = categoryKey.replace(".", "");
        categoryKey = categoryKey.replace(" ", "");
        categoryKey = categoryKey.replace("_", "");

        preHtml += barTemplate.replace(/INPUT_VALUE/gi, "chart_" + categoryKey + "scenario_" + count).replace('INPUT_DATA', field);

    });
    preHtml += '</div></div></div>';
 
    return preHtml;
}

function getScenarioresults(total, change, count) {
    var preHtml = '<div class="scenariobarBox" id="scenario_rsltbox_' + count + '">';

    var scenariorsltHtml = '<div class="card contntBox"><div class="card-body padLR5"><div id="scenario_new_spend_value_' + count + '" class="scnriovaluebox"><p  class="cntntBoxscnrhdr text-left">New Scenario ' + count + ' Spend</p><h4 class="cntntBoxitms text-left">$' + total + '</h4></div><div class="scnriovaluebox"><p class="cntntBoxscnrhdr text-right">Change in Spend</p><h4 id="scenario_change_spend_value_' + count + '" class="cntntBoxitms text-right compchngspndval"> $ ' + change + '</h4><h6 id="scenario_new_spend_percent_' + count + '" class="cntntBoxitms_suffix text-right">(0.00%)</h6></div></div></div>';
    preHtml += scenariorsltHtml;
    preHtml += '</div>';
   
    return preHtml;
}

function addcompScenario(counter) {

    if (globalJson != undefined && globalJson != null) {
        var total = 0;
        $.each(globalJson, function (key, field) {
            // if (key != "PR") {
            //     total += parseFloat(field);
            // }
            total += parseFloat(field);
        });
        $("#compscnrboxOne").append(getcompScenarioresults(commaSeparateNumber(0), 0, counter));

    }
}

function addcompScenarioROI(counter) {

    if (globalJson != undefined && globalJson != null) {
        var total = 0;
        $.each(globalJson, function (key, field) {
            // if (key != "PR") {
            //     total += parseFloat(field);
            // }
            total += parseFloat(field);
        });
        $("#compscnrboxROI").append(getcompScenarioROIresults(0, 0, counter));

    }
}


function getcompScenarioresults(total, change, count) {

    var preHtml = '<div class="col mx-auto" id="scenario_comp_new_spend_value_' + count + '">';


    var scenariorsltHtml = '<div class="card contntBox"><div class="card-body padLR5"><div class="scnriovaluebox"><p class="cntntBoxscnrhdr text-left">New Scenario ' + count + ' Spend</p><h4 class="cntntBoxitms text-left" id="AAA_' + count + '">' + total + '</h4></div><div class="scnriovaluebox"><p class="cntntBoxscnrhdr text-right">Change in Spend</p><h4 id="scenario_comp_change_spend_value_' + count + '" class="cntntBoxitms text-right"> $ ' + change + '</h4><h6 id="scenario_comp_new_spend_percent_' + count + '" class="cntntBoxitms_suffix text-right">(0.00%)</h6></div></div></div>';
    //  scenariorsltHtml = scenariorsltHtml.replace("$COUNT$", count);
    preHtml += scenariorsltHtml;
      
    preHtml += '</div>';
    //  alert(preHtml);
    return preHtml;
}

function getcompScenarioROIresults(total, change, count) {

    var preHtml = '<div class="col mx-auto" id="scenario_comp_new_roi_value_' + count + '">';

    var scenariorsltHtml = '<div class="card contntBox"><div class="card-body padLR5"><div class="scnriovaluebox"><p class="cntntBoxscnrhdr text-left">New Scenario ' + count + ' ROI</p><h4 class="cntntBoxitms text-left" id="ROI_' + count + '">' + total + '</h4></div><div class="scnriovaluebox"><p class="cntntBoxscnrhdr text-right">Change in ROI</p><h4 id="scenario_comp_roi_value_' + count + '" class="cntntBoxitms text-right"> $ ' + change + '</h4><h6 id="scenario_comp_roi_percent_' + count + '" class="cntntBoxitms_suffix text-right">(0.00%)</h6></div></div></div>';
   
    preHtml += scenariorsltHtml;
      
    preHtml += '</div>';
    //  alert(preHtml);
    return preHtml;
}

function getcompScenariobookingsresults(total, change, count) {

    var preHtml = '<div class="col mx-auto" id="scenario_new_revnue_value_' + count + '">';

    var scenariorsltHtml = '<div class="card contntBox"><div class="card-body padLR2"><div class="scnriovaluebox"><p class="cntntBoxscnrhdr text-left">New Scenario ' + count + ' Sales</p><h4 class="cntntBoxitms text-left" id="BBB_' + count + '">' + total + '</h4></div><div class="scnriovaluebox"><p class="cntntBoxscnrhdr text-right">Change in Sales</p><h4 id="scenario_bookings_change_value_' + count + '" class="cntntBoxitms text-right">  $ ' + change + '</h4><h6 id="scenario_bookings_new_percent_' + count + '" class="cntntBoxitms_suffix text-right">(0.00%)</h6></div></div></div>';
   
    preHtml += scenariorsltHtml;
    preHtml += '</div>';
 
    return preHtml;
}

function getcompScenariobtns(count) {

    var preHtml = '<div class="col mx-auto text-center">';
  
    var scenariorsltHtml = ' <button type="button" class="btn btn-raised btn-analysis" data-toggle="modal" data-target=".scenarioModal_' + count + '" id="dabtnscnr_' + count + '" onClick="scenarioanalysbtn_click(this.id)" >Detailed Analysis</button>';
  
    preHtml += scenariorsltHtml;
    preHtml += '</div>';
 
    return preHtml;
}

function addbtnforScenario(counter) {

    if (globalJson != undefined && globalJson != null) {
        $("#compscnrbtnboxThree").append(getcompScenariobtns(counter));
    }
}

function addcompScenariobookings(counter) {

    if (globalJson != undefined && globalJson != null) {
        var total = 0;
        $.each(globalJson, function (key, field) {
            // if (key != "PR") {
            //     total += parseFloat(field);
            // }
            total += parseFloat(field);
        });
        $("#compscnrboxTwo").append(getcompScenariobookingsresults(commaSeparateNumber(0), 0, counter));

    }
}





// function will decide the spend values container based on counter value assumption
//is if counter value undefined scenario compariosn page sloders else main page.

function updateSpendValues(counter) {
    //alert(counter);
    var totalNewSpendValues = 0;
    var total = 0;
    var changeValuePositiveHtml = '<i class="fa fa-arrow-up green" id="labl_green" aria-hidden="true"></i> $$CHANGED_VALUE$';
    var changeValueNegativeHtml = '<i class="fa fa-arrow-down red" id="labl_red" aria-hidden="true"></i> $$CHANGED_VALUE$';

    // alert("initital Total : " + totalNewSpendValues);

    $("ul.scnrsegmntchart").each(function () {
        var currentId = this.id;
        
        if (counter != undefined && $(this).find('li:nth-child(1)').children('.percent.scenario_' + counter).html() != undefined) {
           
            totalNewSpendValues += parseFloat(removeCommaAndK_Mvalues($(this).find('li:nth-child(1)').children('.percent.scenario_' + counter).html().replace("$", "")));
            total += parseFloat(removeCommaAndK_Mvalues($(this).find('li:nth-child(2)').children('.percent').html().replace("$", "")));

        } else if (counter == undefined && $(this).find('li:nth-child(1)').children('.percent').html() != undefined) {
           
            totalNewSpendValues += parseFloat(removeCommaAndK_Mvalues($(this).find('li:nth-child(1)').children('.percent').html().replace("$", "")));
            total +=parseFloat(removeCommaAndK_Mvalues($(this).find('li:nth-child(2)').children('.percent').html().replace("$", "")));
        }

    });


    // if (globalJson != undefined && globalJson != null) {
    //     var total = 0;
    //     alert(JSON.stringify(globalJson))

    //     $.each(globalJson, function (key, field) {
    //         // if (!key.includes("PR")) {

    //         //     total += parseFloat(field);
    //         // }
    //         total += parseFloat(field);


    //     });
    // }

    var totalBaseSpendValues = total;
    // alert(totalBaseSpendValues +" - "+totalNewSpendValues);

    var changeSpend = round(totalNewSpendValues - totalBaseSpendValues, 2);
    var percentage = ((totalNewSpendValues - totalBaseSpendValues) / totalBaseSpendValues) * 100;


    if (counter != undefined) {
        // alert("inside : "+counter);
        if (round(changeSpend / 1000, 0) == 0) {
            $("#scenario_change_spend_value_" + counter).html("$ 0");
        } else {
            $("#scenario_change_spend_value_" + counter).html(round(changeSpend / 1000, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(changeSpend)) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(changeSpend)));
        }

        $("#scenario_new_spend_percent_" + counter).html("(" + round(percentage, 2) + " %)");
        $("#scenario_new_spend_value_" + counter).html('<p  class="cntntBoxscnrhdr text-left">New Scenario ' + counter + ' Spend</p><h4 class="cntntBoxitms text-left">$' + commaSeparateNumber(totalNewSpendValues) + '</h4>');
    } else {
        $("#newScenarioSpendValue").html("$ " + commaSeparateNumber(totalNewSpendValues));
        $("#baseScenarioSpendValue").html("$ " + commaSeparateNumber(totalBaseSpendValues));
        $("#baseScenarioSpendChangePercent").html("(" + round(percentage, 2) + "%)");
        if (round(changeSpend / 1000, 0) == 0) {
            $("#baseScenarioSpendChange").html("$ 0");

        } else {
            $("#baseScenarioSpendChange").html(round(changeSpend / 1000, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(changeSpend)) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(changeSpend)));
        }

    }


}


$("#runscenariocomp").on("click", function () {

    $("#pageloaddiv").show();

    var compformdata = getChangedScenarioForms();
    // alert('compformdata::' + JSON.stringify(compformdata));
    if (changedFormsID.length < 2) {
        $("#pageloaddiv").hide();
        alert("Please input atleast Two Scenarios For  Comaprison");
        changedFormsID = [];
        // alert(changedFormsID.length);
        return false;
    }

    $(document).scrollTop(0);
    $("#pageloaddiv").show();
    $(".scnarcompmainhdr").hide();
    $(".scnarcompainhdrrslts").show();
    $("#scnrcompinputBox").hide();
    $("#comppagelegends").hide();
    $("#scnrcomprsltsBox").slideDown("600", function () {
        $(".btn-celebrity").hide();
        $("#pageloaddiv").show();

    });

    var value1 = "All";
    var value2 = "All";
    var value3 = "All";
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "storecompformdata",
        data: JSON.stringify(compformdata),
        success: function (resp) {
            // alert(resp)
            $.each(changedFormsID, function (index, idnum) {
                addcompScenario(idnum);
                addcompScenariobookings(idnum);
                addcompScenarioROI(idnum);
                addbtnforScenario(idnum);
            });

            var data = {
                callname: "groupedcomparebarchart"
            };
            // alert(JSON.stringify(data));
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "sceneanalysis",
                data: JSON.stringify(data),
                success: function (resp) {

                    groupedCompareBarChart(resp);
                    comppagevaluechange();
                },
                dataType: "json"
            });
            $("#pageloaddiv").hide();
        },

        dataType: "json"
    });


});

function scenarioanalysbtn_click(scnrbtn_id) {
    // alert(scnrbtn_id);
    var buttonnumber = scnrbtn_id.slice(-1);
    if (buttonnumber == 1) {
        var scene = scnrbtn_id;
        var value1 = $("#modalproductdropdown1 option:selected").text();
        var value2 = $("#modalchanneldropdown1 option:selected").text();
        var value3 = $("#modalcountrydropdown1 option:selected").text();
        if (value1 == 'Product 1'){
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2'){
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3'){
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4'){
            value1 = 'Europe';
        }
        if (value1 == 'Product 5'){
            value1 = 'Long Caribbean';
        }
        // alert(JSON.stringify(scene));
        var senddata = {
            scenarioNumber: scene,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]
        };
        // alert(JSON.stringify(senddata));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "detailedanalysis",
            data: JSON.stringify(senddata),
            success: function (resp) {
                // alert(JSON.stringify(resp));

                // Contribution Tab
                var cTabData = resp.contributionTabData;
                var cTabBoxData = cTabData.contributionTabBoxData;
                var cTabChartData = cTabData.contributionTabChartData;


                $("#modalnewscnrbookonslct").html(commaSeparatevalue(round(cTabBoxData.newBookings, 0)));
                $("#modalbasescnrbookonslct").html(commaSeparatevalue(round(cTabBoxData.baseBookings, 0)));
                if (round(cTabBoxData.changeInBooings, 0) == 0) {
                    $("#modalchnginspndonslct").html("0");
                } else {

                    $("#modalchnginspndonslct").html(round(cTabBoxData.changeInBooings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))));
                }
                // $("#modalchnginspndonslct").html(commaSeparatevalue(round(cTabBoxData.changeInBooings, 0)));
                $("#modalchnginspndonslctprcnt").html("(" + commaSeparatevalue(round(cTabBoxData.changeInBooingsPercent, 2)) + "%)");
                //base pie chart
                var appendTo = "modalscnrrsltpieChartBase";
                var plotdata = cTabChartData.basePieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //new pie chart
                var appendTo = "modalscnrrsltpieChart";
                var plotdata = cTabChartData.newPieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //grouped horizontal bar chart
                var appendTo = "modalincrmtblowChart";
                var plotdata = cTabChartData.groupedContributionChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalgroupedhorizontalbarchart(appendTo, plotdata, buttonnumber);

                // ROI Tab
                var rTabData = resp.roiTabData;
                var rTabBoxData = rTabData.roiTabBoxData;
                var rTabChartData = rTabData.roiTabChartData;
                $("#modalnewroibox").html("$ " + commaSeparatevalue(round(rTabBoxData.newROI, 2)));
                $("#modalbaseroibox").html("$ " + commaSeparatevalue(round(rTabBoxData.baseROI, 2)));
                // $("#modalroichangebox").html(commaSeparatevalue(round(rTabBoxData.changeROI, 2)));
                if (round(rTabBoxData.changeROI, 2) == 0) {
                    $("#modalroichangebox").html("$ 0");
                } else {
                    $("#modalroichangebox").html(round(rTabBoxData.changeROI, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))));
                }
                $("#modalroichangepercentbox").html("(" + commaSeparatevalue(round(rTabBoxData.changeROIPercent, 2)) + "%)");

                // grouped roi chart
                var appendTo = "modalroibaseChart";
                var plotdata = rTabChartData.grouped_roi_dict;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalGroupedRoiBarChart(appendTo, plotdata);


            },

            dataType: "json"
        });

    } else if (buttonnumber == 2) {
        var scene = scnrbtn_id;
        var value1 = $("#modalproductdropdown2 option:selected").text();
        var value2 = $("#modalchanneldropdown2 option:selected").text();
        var value3 = $("#modalcountrydropdown2 option:selected").text();
        if (value1 == 'Product 1'){
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2'){
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3'){
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4'){
            value1 = 'Europe';
        }
        if (value1 == 'Product 5'){
            value1 = 'Long Caribbean';
        }
        // alert(JSON.stringify(scene));

        var senddata = {
            scenarioNumber: scene,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]
        };
        // alert(JSON.stringify(senddata));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "detailedanalysis",
            data: JSON.stringify(senddata),
            success: function (resp) {
                // alert(JSON.stringify(resp));

                // Contribution Tab
                var cTabData = resp.contributionTabData;
                var cTabBoxData = cTabData.contributionTabBoxData;
                var cTabChartData = cTabData.contributionTabChartData;
                $("#modalnewscnrbookonslct2").html(commaSeparatevalue(round(cTabBoxData.newBookings, 0)));
                $("#modalbasescnrbookonslct2").html(commaSeparatevalue(round(cTabBoxData.baseBookings, 0)));
                // $("#modalchnginspndonslct2").html(commaSeparatevalue(round(cTabBoxData.changeInBooings, 0)));
                if (round(cTabBoxData.changeInBooings, 0) == 0) {
                    $("#modalchnginspndonslct2").html("0");
                } else {

                    $("#modalchnginspndonslct2").html(round(cTabBoxData.changeInBooings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))));
                }
                $("#modalchnginspndonslctprcnt2").html("(" + commaSeparatevalue(round(cTabBoxData.changeInBooingsPercent, 2)) + "%)");
                //base pie chart
                var appendTo = "modalscnrrsltpieChartBase2";
                var plotdata = cTabChartData.basePieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //new pie chart
                var appendTo = "modalscnrrsltpieChart2";
                var plotdata = cTabChartData.newPieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //grouped horizontal bar chart
                var appendTo = "modalincrmtblowChart2";
                var plotdata = cTabChartData.groupedContributionChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalgroupedhorizontalbarchart(appendTo, plotdata, buttonnumber);

                // ROI Tab
                var rTabData = resp.roiTabData;
                var rTabBoxData = rTabData.roiTabBoxData;
                var rTabChartData = rTabData.roiTabChartData;
                $("#modalnewroibox2").html("$ " + commaSeparatevalue(round(rTabBoxData.newROI, 2)));
                $("#modalbaseroibox2").html("$ " + commaSeparatevalue(round(rTabBoxData.baseROI, 2)));
                // $("#modalroichangebox2").html(commaSeparatevalue(round(rTabBoxData.changeROI, 2)));
                if (round(rTabBoxData.changeROI, 2) == 0) {
                    $("#modalroichangebox2").html("$ 0");
                } else {
                    $("#modalroichangebox2").html(round(rTabBoxData.changeROI, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))));
                }
                $("#modalroichangepercentbox2").html("(" + commaSeparatevalue(round(rTabBoxData.changeROIPercent, 2)) + "%)");


                // grouped roi chart
                var appendTo = "modalroibaseChart2";
                var plotdata = rTabChartData.grouped_roi_dict;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalGroupedRoiBarChart(appendTo, plotdata);


            },

            dataType: "json"
        });

    } else {
        var scene = scnrbtn_id;
        var value1 = $("#modalproductdropdown3 option:selected").text();
        var value2 = $("#modalchanneldropdown3 option:selected").text();
        var value3 = $("#modalcountrydropdown3 option:selected").text();
        if (value1 == 'Product 1'){
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2'){
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3'){
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4'){
            value1 = 'Europe';
        }
        if (value1 == 'Product 5'){
            value1 = 'Long Caribbean';
        }
        // alert(JSON.stringify(scene));
        // alert("Got Data 1");
        var senddata = {
            scenarioNumber: scene,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]
        };
        // alert(JSON.stringify(senddata));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "detailedanalysis",
            data: JSON.stringify(senddata),
            success: function (resp) {
                // alert(JSON.stringify(resp));

                // Contribution Tab
                var cTabData = resp.contributionTabData;
                var cTabBoxData = cTabData.contributionTabBoxData;
                var cTabChartData = cTabData.contributionTabChartData;
                $("#modalnewscnrbookonslct3").html(commaSeparatevalue(round(cTabBoxData.newBookings, 0)));
                $("#modalbasescnrbookonslct3").html(commaSeparatevalue(round(cTabBoxData.baseBookings, 0)));
                if (round(cTabBoxData.changeInBooings, 0) == 0) {
                    $("#modalchnginspndonslct3").html("0");
                } else {
                    $("#modalchnginspndonslct3").html(round(cTabBoxData.changeInBooings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))));
                }
                $("#modalchnginspndonslctprcnt3").html("(" + commaSeparatevalue(round(cTabBoxData.changeInBooingsPercent, 2)) + "%)");
                //base pie chart
                var appendTo = "modalscnrrsltpieChartBase3";
                var plotdata = cTabChartData.basePieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //new pie chart
                var appendTo = "modalscnrrsltpieChart3";
                var plotdata = cTabChartData.newPieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //grouped horizontal bar chart
                var appendTo = "modalincrmtblowChart3";
                var plotdata = cTabChartData.groupedContributionChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalgroupedhorizontalbarchart(appendTo, plotdata, buttonnumber);

                // ROI Tab
                var rTabData = resp.roiTabData;
                var rTabBoxData = rTabData.roiTabBoxData;
                var rTabChartData = rTabData.roiTabChartData;
                $("#modalnewroibox3").html("$ " + commaSeparatevalue(round(rTabBoxData.newROI, 2)));
                $("#modalbaseroibox3").html("$ " + commaSeparatevalue(round(rTabBoxData.baseROI, 2)));
                // $("#modalroichangebox3").html(commaSeparatevalue(round(rTabBoxData.changeROI, 2)));
                if (round(rTabBoxData.changeROI, 2) == 0) {
                    $("#modalroichangebox3").html("$ 0");
                } else {
                    $("#modalroichangebox3").html(round(rTabBoxData.changeROI, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))));
                }
                $("#modalroichangepercentbox3").html("(" + commaSeparatevalue(round(rTabBoxData.changeROIPercent, 2)) + "%)");


                // grouped roi chart
                var appendTo = "modalroibaseChart3";
                var plotdata = rTabChartData.grouped_roi_dict;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalGroupedRoiBarChart(appendTo, plotdata);

            },

            dataType: "json"
        });

    }

}



function modalfilter(filter_id) {
    // alert(filter_id);
    var buttonnumber = filter_id.slice(-1);
    if (buttonnumber == 1) {
        var scene = filter_id;
        var value1 = $("#modalproductdropdown1 option:selected").text();
        var value2 = $("#modalchanneldropdown1 option:selected").text();
        var value3 = $("#modalcountrydropdown1 option:selected").text();
        if (value1 == 'Product 1'){
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2'){
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3'){
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4'){
            value1 = 'Europe';
        }
        if (value1 == 'Product 5'){
            value1 = 'Long Caribbean';
        }
        if (value3 == 'CAN') {
            $("#modalchanneldropdown1 option[value='2']").hide();
        } else {
            $("#modalchanneldropdown1 option[value='2']").show();
        }
        if (value2 == 'Trade-OTA') {
            $("#modalcountrydropdown1 option[value='2']").hide();
        } else {
            $("#modalcountrydropdown1 option[value='2']").show();
        }
        // alert(value1, value2, value3);
        // alert("Got Data 1");
        var senddata = {
            scenarioNumber: scene,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]
        };
        // alert(JSON.stringify(senddata));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "detailedanalysis",
            data: JSON.stringify(senddata),
            success: function (resp) {
                // alert(JSON.stringify(resp));

                // Contribution Tab
                var cTabData = resp.contributionTabData;
                var cTabBoxData = cTabData.contributionTabBoxData;
                var cTabChartData = cTabData.contributionTabChartData;
                $("#modalnewscnrbookonslct").html(commaSeparatevalue(round(cTabBoxData.newBookings, 0)));
                $("#modalbasescnrbookonslct").html(commaSeparatevalue(round(cTabBoxData.baseBookings, 0)));
                // $("#modalchnginspndonslct").html(commaSeparatevalue(round(cTabBoxData.changeInBooings, 0)));
                if (round(cTabBoxData.changeInBooings, 0) == 0) {
                    $("#modalchnginspndonslct").html("0");
                } else {

                    $("#modalchnginspndonslct").html(round(cTabBoxData.changeInBooings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))));
                }
                $("#modalchnginspndonslctprcnt").html("(" + commaSeparatevalue(round(cTabBoxData.changeInBooingsPercent, 2)) + "%)");
                //base pie chart
                var appendTo = "modalscnrrsltpieChartBase";
                var plotdata = cTabChartData.basePieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //new pie chart
                var appendTo = "modalscnrrsltpieChart";
                var plotdata = cTabChartData.newPieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //grouped horizontal bar chart
                var appendTo = "modalincrmtblowChart";
                var plotdata = cTabChartData.groupedContributionChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalgroupedhorizontalbarchart(appendTo, plotdata, buttonnumber);

                // ROI Tab
                var rTabData = resp.roiTabData;
                var rTabBoxData = rTabData.roiTabBoxData;
                var rTabChartData = rTabData.roiTabChartData;
                $("#modalnewroibox").html("$ " + commaSeparatevalue(round(rTabBoxData.newROI, 2)));
                $("#modalbaseroibox").html("$ " + commaSeparatevalue(round(rTabBoxData.baseROI, 2)));
                // $("#modalroichangebox").html(commaSeparatevalue(round(rTabBoxData.changeROI, 2)));
                if (round(rTabBoxData.changeROI, 2) == 0) {
                    $("#modalroichangebox").html("$ 0");
                } else {
                    $("#modalroichangebox").html(round(rTabBoxData.changeROI, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))));
                }
                $("#modalroichangepercentbox").html("(" + commaSeparatevalue(round(rTabBoxData.changeROIPercent, 2)) + "%)");


                // grouped roi chart
                var appendTo = "modalroibaseChart";
                var plotdata = rTabChartData.grouped_roi_dict;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalGroupedRoiBarChart(appendTo, plotdata);

            },

            dataType: "json"
        });

    } else if (buttonnumber == 2) {
        var scene = filter_id;
        var value1 = $("#modalproductdropdown2 option:selected").text();
        var value2 = $("#modalchanneldropdown2 option:selected").text();
        var value3 = $("#modalcountrydropdown2 option:selected").text();
        if (value1 == 'Product 1'){
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2'){
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3'){
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4'){
            value1 = 'Europe';
        }
        if (value1 == 'Product 5'){
            value1 = 'Long Caribbean';
        }
        // alert(JSON.stringify(scene));
        // alert("Got Data 1");
        if (value3 == 'CAN') {
            $("#modalchanneldropdown2 option[value='2']").hide();
        } else {
            $("#modalchanneldropdown2 option[value='2']").show();
        }
        if (value2 == 'Trade-OTA') {
            $("#modalcountrydropdown2 option[value='2']").hide();
        } else {
            $("#modalcountrydropdown2 option[value='2']").show();
        }
        var senddata = {
            scenarioNumber: scene,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]
        };
        // alert(JSON.stringify(senddata));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "detailedanalysis",
            data: JSON.stringify(senddata),
            success: function (resp) {
                // alert(JSON.stringify(resp));

                // Contribution Tab
                var cTabData = resp.contributionTabData;
                var cTabBoxData = cTabData.contributionTabBoxData;
                var cTabChartData = cTabData.contributionTabChartData;
                $("#modalnewscnrbookonslct2").html(commaSeparatevalue(round(cTabBoxData.newBookings, 0)));
                $("#modalbasescnrbookonslct2").html(commaSeparatevalue(round(cTabBoxData.baseBookings, 0)));
                // $("#modalchnginspndonslct2").html(commaSeparatevalue(round(cTabBoxData.changeInBooings, 0)));
                if (round(cTabBoxData.changeInBooings, 0) == 0) {
                    $("#modalchnginspndonslct2").html("0");
                } else {

                    $("#modalchnginspndonslct2").html(round(cTabBoxData.changeInBooings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))));
                }
                $("#modalchnginspndonslctprcnt2").html("(" + commaSeparatevalue(round(cTabBoxData.changeInBooingsPercent, 2)) + "%)");
                //base pie chart
                var appendTo = "modalscnrrsltpieChartBase2";
                var plotdata = cTabChartData.basePieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //new pie chart
                var appendTo = "modalscnrrsltpieChart2";
                var plotdata = cTabChartData.newPieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //grouped horizontal bar chart
                var appendTo = "modalincrmtblowChart2";
                var plotdata = cTabChartData.groupedContributionChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalgroupedhorizontalbarchart(appendTo, plotdata, buttonnumber);

                // ROI Tab
                var rTabData = resp.roiTabData;
                var rTabBoxData = rTabData.roiTabBoxData;
                var rTabChartData = rTabData.roiTabChartData;
                $("#modalnewroibox2").html("$ " + commaSeparatevalue(round(rTabBoxData.newROI, 2)));
                $("#modalbaseroibox2").html("$ " + commaSeparatevalue(round(rTabBoxData.baseROI, 2)));
                // $("#modalroichangebox2").html(commaSeparatevalue(round(rTabBoxData.changeROI, 2)));
                if (round(rTabBoxData.changeROI, 2) == 0) {
                    $("#modalroichangebox2").html("$ 0");
                } else {
                    $("#modalroichangebox2").html(round(rTabBoxData.changeROI, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))));
                }
                $("#modalroichangepercentbox2").html("(" + commaSeparatevalue(round(rTabBoxData.changeROIPercent, 2)) + "%)");


                // grouped roi chart
                var appendTo = "modalroibaseChart2";
                var plotdata = rTabChartData.grouped_roi_dict;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalGroupedRoiBarChart(appendTo, plotdata);

            },

            dataType: "json"
        });

    } else {
        var scene = filter_id;
        var value1 = $("#modalproductdropdown3 option:selected").text();
        var value2 = $("#modalchanneldropdown3 option:selected").text();
        var value3 = $("#modalcountrydropdown3 option:selected").text();
        if (value1 == 'Product 1'){
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2'){
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3'){
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4'){
            value1 = 'Europe';
        }
        if (value1 == 'Product 5'){
            value1 = 'Long Caribbean';
        }
        // alert(JSON.stringify(scene));
        // alert("Got Data 1");
        if (value3 == 'CAN') {
            $("#modalchanneldropdown3 option[value='2']").hide();
        } else {
            $("#modalchanneldropdown3 option[value='2']").show();
        }
        if (value2 == 'Trade-OTA') {
            $("#modalcountrydropdown3 option[value='2']").hide();
        } else {
            $("#modalcountrydropdown3 option[value='2']").show();
        }
        var senddata = {
            scenarioNumber: scene,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]
        };
        // alert(JSON.stringify(senddata));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "detailedanalysis",
            data: JSON.stringify(senddata),
            success: function (resp) {
                // alert(JSON.stringify(resp));

                // Contribution Tab
                var cTabData = resp.contributionTabData;
                var cTabBoxData = cTabData.contributionTabBoxData
                var cTabChartData = cTabData.contributionTabChartData
                $("#modalnewscnrbookonslct3").html(commaSeparatevalue(round(cTabBoxData.newBookings, 0)));
                $("#modalbasescnrbookonslct3").html(commaSeparatevalue(round(cTabBoxData.baseBookings, 0)));
                // $("#modalchnginspndonslct3").html(commaSeparatevalue(round(cTabBoxData.changeInBooings, 0)));
                if (round(cTabBoxData.changeInBooings, 0) == 0) {
                    $("#modalchnginspndonslct3").html("0");
                } else {

                    $("#modalchnginspndonslct3").html(round(cTabBoxData.changeInBooings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(cTabBoxData.changeInBooings, 0))));
                }
                $("#modalchnginspndonslctprcnt3").html("(" + commaSeparatevalue(round(cTabBoxData.changeInBooingsPercent, 2)) + "%)");
                //base pie chart
                var appendTo = "modalscnrrsltpieChartBase3"
                var plotdata = cTabChartData.basePieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //new pie chart
                var appendTo = "modalscnrrsltpieChart3"
                var plotdata = cTabChartData.newPieChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);
                //grouped horizontal bar chart
                var appendTo = "modalincrmtblowChart3"
                var plotdata = cTabChartData.groupedContributionChart;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalgroupedhorizontalbarchart(appendTo, plotdata, buttonnumber);

                // ROI Tab
                var rTabData = resp.roiTabData;
                var rTabBoxData = rTabData.roiTabBoxData;
                var rTabChartData = rTabData.roiTabChartData;
                $("#modalnewroibox3").html("$ " + commaSeparatevalue(round(rTabBoxData.newROI, 2)));
                $("#modalbaseroibox3").html("$ " + commaSeparatevalue(round(rTabBoxData.baseROI, 2)));
                // $("#modalroichangebox3").html(commaSeparatevalue(round(rTabBoxData.changeROI, 2)));
                if (round(rTabBoxData.changeROI, 2) == 0) {
                    $("#modalroichangebox3").html("$ 0");
                } else {
                    $("#modalroichangebox3").html(round(rTabBoxData.changeROI, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(rTabBoxData.changeROI, 2))));
                }
                $("#modalroichangepercentbox3").html("(" + commaSeparatevalue(round(rTabBoxData.changeROIPercent, 2)) + "%)");


                // grouped roi chart
                var appendTo = "modalroibaseChart3"
                var plotdata = rTabChartData.grouped_roi_dict;
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalGroupedRoiBarChart(appendTo, plotdata);

            },

            dataType: "json"
        });

    }
}


function groupedCompareBarChart(response) {
    var margin = {
            top: 30,
            right: 20,
            bottom: 50,
            left: 40
        },
        width = 960 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var svg = d3.select("#scnrcomprsltschartBox").append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 960 300")
        .classed("svg-content", true)
        .attr("id", "Roigroupcomp")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal().range(["#B4BAB8", "#F77C05", "#4F81BC"]);

    var data = response;

    var scnrpercents = d3.keys(data[0]).filter(function (key) {
        return key !== "Label";
    });
  
    data.forEach(function (d) {
        d.itempercents = scnrpercents.map(function (name) {
            return {
                name: name,
                // value: +d[name],
                value: d[name] > 70 ? 70 : +d[name],
                displayValue: +d[name]
            };

        });
    });

    x0.domain(data.map(function (d) {
        return d.Label;
    }));
    x1.domain(scnrpercents).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function (c) {
        return d3.max(c.itempercents, function (d, i) {
              return d.value;
        });
    })]);

    var formatpercentValue = d3.format(".1%");

    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function (d) {
            return "translate(" + x0(d.Label) + ",0)";
        })
        .selectAll("rect")
        .data(function (d) {
            return d.itempercents;
        })
        .enter().append("rect")
        // .attr("class", "adi")
        .attr("x", function (d) {
            return x1(d.name);
        })
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("width", x1.bandwidth())
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .attr("fill", function (d) {
            return z(d.name);
        });

    svg.append("g")
        .attr("class", "horzgrpbarbottmtext")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function (d) {
            return "translate(" + x0(d.Label) + ",0)";
        });

    state.selectAll("rect")
        .data(function (d) {
            return d.itempercents;
        })
        .enter().append("rect")
        .attr("class", "bars")
        .attr("width", x1.bandwidth())
        .attr("x", function (d) {
            return x1(d.name);
        })
        .attr("y", function (d) {
            return y(d.value);
        })
        .attr("height", function (d) {
            return height - y(d.value);
        })
        .style("fill", function (d) {
            return z(d.name);
        });

    state.selectAll("text")
        .data(function (d) {
            return d.itempercents;
        })
        .enter().append("text")
        .attr("class", "compbarstext")
        .text(function (d) {
            return "$" + round(d.displayValue, 2);
        })
        .attr("transform", "rotate(-20)")
        .attr("x", function (d, i) {
            return ((x1(d.name) + (x1.bandwidth() / 2) - 5) * Math.cos(-20 * Math.PI / 180) + (y(d.value) - 2) * Math.sin(-20 * Math.PI / 180));
        })
        .attr("y", function (d) {
            return (-(x1(d.name) + (x1.bandwidth() / 2) - 5) * Math.sin(-20 * Math.PI / 180) + (y(d.value) - 2) * Math.cos(-20 * Math.PI / 180));
        })


    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("text-anchor", "end")
        .selectAll("g")
        .data(z.domain())
        .enter().append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) {
            return d.replace(/_/g, " ");
        });

}



function comppagevaluechange() {
    $.get("comppagedata", function(resp) {
        // alert('data::' + JSON.stringify(resp.bdata));
        // alert('tdata::' + JSON.stringify(resp.tdata));
        var bdata = resp.bdata;
        var tdata = resp.tdata;
        // alert(JSON.stringify(bdata));
        var changeValuePositiveHtml = '$CHANGED_VALUE$ <i class="fa fa-arrow-up green" aria-hidden="true"></i>';
        var changeValueNegativeHtml = '$CHANGED_VALUE$ <i class="fa fa-arrow-down red" aria-hidden="true"></i>';
        var change1spendprcnt = ((bdata.NewScene1Spend - bdata.BaseSpend) / bdata.BaseSpend) * 100;
        var change2spendprcnt = ((bdata.NewScene2Spend - bdata.BaseSpend) / bdata.BaseSpend) * 100;
        var change3spendprcnt = ((bdata.NewScene3Spend - bdata.BaseSpend) / bdata.BaseSpend) * 100;
        var change1bookingprcnt = ((bdata.NewScene1Bookings - bdata.BaseBookings) / bdata.BaseBookings) * 100;
        var change2bookingprcnt = ((bdata.NewScene2Bookings - bdata.BaseBookings) / bdata.BaseBookings) * 100;
        var change3bookingprcnt = ((bdata.NewScene3Bookings - bdata.BaseBookings) / bdata.BaseBookings) * 100;

        $("#compbasespend").html("$ " + commaSeparateNumber(round(bdata.BaseSpend, 0)));
        $("#compbasebooking").html(commaSeparatevalue(round(bdata.BaseBookings, 0)));

        $("#AAA_1").html("$ " + commaSeparateNumber(round(bdata.NewScene1Spend, 0)));
        $("#BBB_1").html(commaSeparatevalue(round(bdata.NewScene1Bookings, 0)));

        $("#compbaseROI").html("$ " + round(bdata.baseROI, 2));

        $("#ROI_1").html("$ " + round(bdata.newROI_1, 2));
        // $("#scenario_comp_roi_value_1").html(round(bdata.changeROI_1, 2));
        if (round(bdata.changeROI_1, 2) == 0) {
            $("#scenario_comp_roi_value_1").html("$ 0");
        } else {
            $("#scenario_comp_roi_value_1").html(round(bdata.changeROI_1, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + round(bdata.changeROI_1, 2)) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + round(bdata.changeROI_1, 2)));
        }

        $("#scenario_comp_roi_percent_1").html("(" + round(bdata.changeROIPercent_1, 2) + "%)");

        $("#ROI_2").html("$ " + round(bdata.newROI_2, 2));
        // $("#scenario_comp_roi_value_2").html(round(bdata.changeROI_2, 2));
        if (round(bdata.changeROI_2, 2) == 0) {
            $("#scenario_comp_roi_value_2").html("$ 0");
        } else {
            $("#scenario_comp_roi_value_2").html(round(bdata.changeROI_2, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + round(bdata.changeROI_2, 2)) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + round(bdata.changeROI_2, 2)));
        }
        $("#scenario_comp_roi_percent_2").html("(" + round(bdata.changeROIPercent_2, 2) + "%)");

        $("#ROI_3").html("$ " + round(bdata.newROI_3, 2));
        // $("#scenario_comp_roi_value_3").html(round(bdata.changeROI_3, 2));

        if (round(bdata.changeROI_3, 2) == 0) {
            $("#scenario_comp_roi_value_3").html("$ 0");
        } else {
            $("#scenario_comp_roi_value_3").html(round(bdata.changeROI_3, 2) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + round(bdata.changeROI_3, 2)) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + round(bdata.changeROI_3, 2)));
        }
        $("#scenario_comp_roi_percent_3").html("(" + round(bdata.changeROIPercent_3, 2) + "%)");

        // $("#compchange1spend").html(commaSeparatevalue(round(bdata.Change1Spend, 0)));
        if (bdata.Change1Spend == 0) {
            $("#scenario_comp_change_spend_value_1").html("$ 0");
        } else {
            $("#scenario_comp_change_spend_value_1").html(bdata.Change1Spend >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$" + commaSeparateNumber(round(bdata.Change1Spend, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$" + commaSeparateNumber(round(bdata.Change1Spend, 0))));
        }

        if (round(bdata.Change1Bookings, 0) == 0) {
            $("#scenario_bookings_change_value_1").html("0");
        } else {

            $("#scenario_bookings_change_value_1").html(round(bdata.Change1Bookings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(bdata.Change1Bookings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(bdata.Change1Bookings, 0))));
        }

        $("#scenario_comp_new_spend_percent_1").html("(" + round(change1spendprcnt, 2) + "%)");
        $("#scenario_bookings_new_percent_1").html("(" + round(change1bookingprcnt, 2) + "%)");

        $("#AAA_2").html("$ " + commaSeparateNumber(round(bdata.NewScene2Spend, 0)));
        $("#BBB_2").html(commaSeparatevalue(round(bdata.NewScene2Bookings, 0)));
        // $("#compchange2spend").html(commaSeparatevalue(round(bdata.Change2Spend, 0)));
        if (bdata.Change2Spend == 0) {
            $("#scenario_comp_change_spend_value_2").html("$ 0");
        } else {
            $("#scenario_comp_change_spend_value_2").html(bdata.Change2Spend >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$" + commaSeparateNumber(round(bdata.Change2Spend, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$" + commaSeparateNumber(round(bdata.Change2Spend, 0))));
        }

        if (round(bdata.Change2Bookings, 0) == 0) {
            $("#scenario_bookings_change_value_2").html("0");
        } else {

            $("#scenario_bookings_change_value_2").html(round(bdata.Change2Bookings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(bdata.Change2Bookings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$',  commaSeparatevalue(round(bdata.Change2Bookings, 0))));
        }
        $("#scenario_comp_new_spend_percent_2").html("(" + round(change2spendprcnt, 2) + "%)");
        $("#scenario_bookings_new_percent_2").html("(" + round(change2bookingprcnt, 2) + "%)");

        $("#AAA_3").html("$ " + commaSeparateNumber(round(bdata.NewScene3Spend, 0)));
        $("#BBB_3").html(commaSeparatevalue(round(bdata.NewScene3Bookings, 0)));
        // $("#compchange3spend").html(commaSeparatevalue(round(bdata.Change3Spend, 0)));
        if (bdata.Change3Spend == 0) {
            $("#scenario_comp_change_spend_value_3").html("$ 0");
        } else {
            $("#scenario_comp_change_spend_value_3").html(bdata.Change3Spend >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$" + commaSeparateNumber(round(bdata.Change3Spend, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$" + commaSeparateNumber(round(bdata.Change3Spend, 0))));
        }

        if (round(bdata.Change3Bookings, 0) == 0) {
            $("#scenario_bookings_change_value_3").html("0");
        } else {

            $("#scenario_bookings_change_value_3").html(round(bdata.Change3Bookings, 0) >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(bdata.Change3Bookings, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(bdata.Change3Bookings, 0))));
        }
        $("#scenario_comp_new_spend_percent_3").html("(" + round(change3spendprcnt, 2) + "%)");
        $("#scenario_bookings_new_percent_3").html("(" + round(change3bookingprcnt, 2) + "%)");
        // alert(JSON.stringify(tdata));
        loadScenarioCompariosnTable("scenario_comparison_table", tdata);
    });


}

function modalPieChart(appendAt, plotdata) {
    //alert('piechart');
    //alert('piechart FormData: '+JSON.stringify(formData));

    var width = 360;
    var height = 360;
    // var svg = d3.select("#scnrrsltpieChartBase")
    var svg = d3.select("#" + appendAt)
        .append("svg")
        // .attr("width", width)
        // .attr("height", height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-55 0 500 350")
        .attr("id", "pie" + appendAt)
        .classed("svg-content", true);

    var radius = Math.min(width, height) / 2;
    var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var color = d3.scaleOrdinal(["#C0504E", "#4F81BC"]);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.Value;
        });

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius - 100)
        .innerRadius(radius - 100);

    //var f = JSON.stringify([{value1: value1, value2: value2, value3:value3}]);
    var data = plotdata


    // alert('piedata main data::'+JSON.stringify(data));
    var arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            return color(d.data.BookingCat);
        });

    arc.append("text")
        .attr("transform", function(d) {
            return "translate(" + label.centroid(d) + ")";
        })
        // .attr("dx", "3em")
        // .attr("dy", "0.85em")
        .attr("text-anchor", "middle")
        .attr("class", "piearctxt")
        .style("fill", "#ffffff")
        //.style("font", "bold 0.89vw Arial")
        .text(function(d) {
            return d.data.BookingCat;
        });


}


function modalgroupedhorizontalbarchart(appendAt, plotdata, btnno) {

    var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 155
        },
        width = 960 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    var svg = d3.select("#" + appendAt).append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1025 705")
        .attr("id", "horizGroup" + appendAt)
        .classed("svg-content", true)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var y0 = d3.scaleBand()
        .rangeRound([height, 0])
        .paddingOuter(0.2)
        .paddingInner(0.2);

    var y1 = d3.scaleBand()
        .padding(0.05);

    var x = d3.scaleLinear()
        .rangeRound([0, width]);


    // var z = d3.scaleOrdinal()
    // 	.range(["#B4BAB8", "#F77C05"]);

    var z = d3.scaleOrdinal()
        .range(["#F77C05", "#B4BAB8"]);

    //var divTooltip = d3.select("body").append("div").attr("class", "toolTip");

    var data = plotdata;

    // alert(JSON.stringify(data[1]));
    $(data).each(function(i, d) {
        var temp = JSON.parse(JSON.stringify(d, ["Label", "New_Scenario_" + btnno, "Base_Scenario"]));
        data[i] = temp;
    });
    // alert("after : " + JSON.stringify(data));

    var filtered = data.filter(function(d) {
        return d.Base_Scenario > 0;
    });
    data = filtered;
    data = data.reverse();

    var n = data.length / 2;
    var itemWidth = 150;
    var itemHeight = 18;

    var scnrpercents = d3.keys(data[0]).filter(function(key) {
        return key !== "Label";
    });

    data.forEach(function(d) {
        d.itempercents = scnrpercents.map(function(name) {
            return {
                name: name,
                value: +d[name]
            };
        });
    });

    y0.domain(data.map(function(d) {
        return d.Label;
    }));
    y1.domain(scnrpercents).rangeRound([0, y0.bandwidth()]);
    x.domain([0, d3.max(data, function(d) {
        return d3.max(d.itempercents, function(d) {
            return d.value;
        });
    })]);


    var formatpercentValue = d3.format(".1%");

    svg.append("g")
        .attr("class", "grpbaryaxistxt")
        .call(d3.axisLeft(y0));

    svg.selectAll(".y.axis .tick text")
        .call(verticalWrap, y0.bandwidth());
    // .call(Horizontalwrap, y0.bandwidth());


    var bar = svg.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "rect")
        .attr("transform", function(d) {
            return "translate( 0," + y0(d.Label) + ")";
        });

    var bar_enter = bar.selectAll("rect")
        .data(function(d) {
            return d.itempercents;
        })
        .enter()


    bar_enter.append("rect")
        .attr("height", y1.bandwidth())
        .attr("y", function(d) {
            return y1(d.name);
        })
        .attr("x", function(d) {
            return 0;
        })
        .attr("value", function(d) {
            return d.name;
        })
        .attr("width", function(d) {
            return x(d.value);
        })
        .style("fill", function(d) {
            return z(d.name);
        });

    bar_enter.append("text")
        .attr("class", "barstext")
        .attr("x", function(d) {
            return x(d.value) + 5;
        })
        .attr("y", function(d) {
            return y1(d.name) + (y1.bandwidth() / 2);
        })

    .attr("dy", ".35em")
        .text(function(d) {
            return formatpercentValue(d.value / 100);
        });

    var legendGroup = svg.append("g")
        .attr("transform", "translate(" + (width - 250) + ",-10)");

    var legend = legendGroup.selectAll(".legend")
        .data(splitjoin(scnrpercents.slice()))
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(" + i % n * itemWidth + "," + Math.floor(i / n) * itemHeight + ")";
        });


    var rects = legend.append('rect')
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", function(d, i) {
            return z(i);
        });

    var text = legend.append('text')
        .attr("x", 15)
        .attr("y", 12)
        .attr("dx", ".45em")
        .attr("dy", ".15em")
        .style("text-anchor", "start")
        .text(function(d) {
            return d;
        });


}

function modalroibarChart(appendAt, plotdata) {

    // set the dimensions and margins of the graph
    var margin = {
            top: 20,
            right: 20,
            bottom: 240,
            left: 40
        },
        width = 1054 - margin.left - margin.right,
        height = 420 - margin.top - margin.bottom;

    // set the ranges
    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
    var y = d3.scaleLinear()
        .range([height, 0]);
    var svg = d3.select("#" + appendAt).append("svg")
        // .attr("width", width)
        // .attr("height", height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1054 220")
        .attr("id", "Roi" + appendAt)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var data = plotdata;

    // alert('roi chart data after::'+ data);
    // format the data
    // alert("before : "+JSON.stringify(data));
    data.forEach(function(d) {
        d["displayValue"] = d.Value;
        d.Value = d.Value >= 70 ? 70 : d.Value;
        // d.Value = +d.Value;

    });
    // alert("before : "+JSON.stringify(data));
  
    x.domain(data.map(function(d) {
        return d.Label;
    }));
    y.domain([0, d3.max(data, function(d) {
        return d.Value;
    })]);
 
    svg.selectAll(".histbar")
        .data(data)
        .enter().append("rect")
        .attr("class", "histbar")
        .attr("x", function(d) {
            return x(d.Label);
        })
        .attr("width", x.bandwidth())
        .attr("y", function(d) {
            return y(d.Value);
        })
        .attr("height", function(d) {
            return height - y(d.Value);
        });

    svg.selectAll("text.histbar")
        .data(data)
        .enter().append("text")
        .attr("class", "histbar")
        .attr("text-anchor", "middle")
        .attr("x", function(d) {
            return x(d.Label) + 30;
        })
        .attr("y", function(d) {
            return y(d.Value) - 10;
        })
        .text(function(d) {
            return round(d.displayValue, 2);
        });


    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .style("text-anchor", "middle");
    
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("ROI");

}

function modalGroupedRoiBarChart(appendAt, plotData) {
    var margin = {
            top: 30,
            right: 20,
            bottom: 30,
            left: 40
        },
        width = 960 - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom;

    var svg = d3.select("#" + appendAt).append("svg")
        // .attr("width", width + margin.left + margin.right)
        // .attr("height", height + margin.top + margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 960 270")
        .attr("id", "Roi" + appendAt)
        .classed("svg-content", true)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x0 = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.1);

    var x1 = d3.scaleBand()
        .padding(0.05);

    var y = d3.scaleLinear()
        .rangeRound([height, 0]);

    var z = d3.scaleOrdinal()
        .range(["#F77C05", "#B4BAB8"]);
    var data = plotData;

    // alert('ValData==>' + JSON.stringify(data));
    var filtered = data.filter(function(d) {
        return d.Base_Scenario > 0;
    });
    data = filtered;
    var scnrpercents = d3.keys(data[0]).filter(function(key) {
        return key !== "Label";
    });

    data.forEach(function(d) {
        d.itempercents = scnrpercents.map(function(name) {
            return {
                name: name,
                // value: +d[name]
                value: d[name] > 70 ? 70 : +d[name],
                displayValue: +d[name]
            };

        });
    });
    // alert('ValData==>' + JSON.stringify(data));
    x0.domain(data.map(function(d) {
        return d.Label;
    }));
    x1.domain(scnrpercents).rangeRound([0, x0.bandwidth()]);
    y.domain([0, d3.max(data, function(c) {
        return d3.max(c.itempercents, function(d) {
            // alert('Data==>' + JSON.stringify(c.itempercents));
            var filtered = c.itempercents.filter(function(d) {
                return d.value > 0;
            });

            return d.value;
        });
    })]);

    var formatpercentValue = d3.format(".1%");
    // alert('2Data==>' + JSON.stringify(data));
    svg.append("g")
        .selectAll("g")
        .data(data)
        .enter().append("g")
        .attr("transform", function(d) {
            return "translate(" + x0(d.Label) + ",0)";
        })
        .selectAll("rect")
        // .data(data)
        .data(function(d) {
            return d.itempercents;
        })
        .enter().append("rect")
        .attr("class", "adi")
        .attr("x", function(d) {
            return x1(d.name);
        })
        .attr("y", function(d) {
            return y(d.value);
        })
        .attr("width", x1.bandwidth())
        .attr("height", function(d) {
            return height - y(d.value);
        })
        .attr("fill", function(d) {
            return z(d.name);
        });



    svg.append("g")
        .attr("class", "horzgrpbarbottmtext")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x0));

    var state = svg.selectAll(".state")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) {
            return "translate(" + x0(d.Label) + ",0)";
        });

    state.selectAll("rect")
        .data(function(d) {
            return d.itempercents;
        })
        .enter().append("rect")
        .attr("class", "bars")
        .attr("width", x1.bandwidth())
        .attr("x", function(d) {
            return x1(d.name);
        })
        .attr("y", function(d) {
            return y(d.value);
        })
        .attr("height", function(d) {
            return height - y(d.value);
        })
        .style("fill", function(d) {
            return z(d.name);
        });

    state.selectAll("text")
        .data(function(d) {
            return d.itempercents;
        })
        .enter().append("text")
        .attr("class", "compbarstext")
        .attr("transform", "rotate(-20)")
        .attr("x", function(d, i) {
            return ((x1(d.name) + (x1.bandwidth() / 2) - 5) * Math.cos(-20 * Math.PI / 180) + (y(d.value) - 2) * Math.sin(-20 * Math.PI / 180));
        })
        .attr("y", function(d) {
            return (-(x1(d.name) + (x1.bandwidth() / 2) - 5) * Math.sin(-20 * Math.PI / 180) + (y(d.value) - 2) * Math.cos(-20 * Math.PI / 180));
        })
        //.attr("dx", ".35em")
        .text(function(d) {
            return "$" + round(d.displayValue, 2);
        });

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
        .selectAll("g")
        // .data(scnrpercents.slice().reverse())
        .data(splitjoin(scnrpercents.slice().reverse()))
        .enter().append("g")
        .attr("transform", function(d, i) {
            return "translate(0," + i * 20 + ")";
        });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 18)
        .attr("height", 18)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) {
            return d;
        });

}

function loadScenarioCompariosnTable(tableName, data) {
    // console.log("Tdata " + JSON.stringify(data));
    // alert("TdataKeys:: " + Object.keys(data)[0]);
    // alert("TdataAT:: " + data[Object.keys(data)[0]]);
    var i = 0;
    if (data[Object.keys(data)[0]].length == 0) {
        i = 1;
    }
    var headerHtml = $('<thead class="tblbg"/>').append(getCoulumnHeaders(data[Object.keys(data)[i]]));

    $('#' + tableName).append(headerHtml);
    var body = $('<tbody/>');
    $.each(data, function(key, obj) {
        body.append(getRowData(key, obj));
    });
    $('#' + tableName).append(body);
}

function getRowData(scenario_count, data) {
    // alert("td data Length "+data.length);
    // alert("td data "+JSON.stringify(data));
    var row = $('<tr/>');
    if (data.length != 0) {
        row.append('<td class="tblscenariocountbox py-2">' + scenario_count.replace(/_/g, " ") + '</td>');
    }
    $.each(data, function(index, obj) {
        // alert(obj.Value);
        if (obj.Value !== null && obj.Value !== 0) {
            row.append('<td class="tblspndrevenuebox spndtxt2 py-2">' + commaSeparatevalue(parseInt(obj.Value)) + '</td>');
        }

    });
    return row;
}

function getCoulumnHeaders(data) {
    // alert('ColumnHdr::' + JSON.stringify(data));
    var row = $('<tr/>');
    var staticvalues = ' <th scope="col" class="tblmainhdrlft">Scenarios </th > ';
    row.append(staticvalues);
    // data.sort(function(a, b) {
    //     return b.Value - a.Value;
    // });
    // alert('After Sort ColumnHdr::'+JSON.stringify(data));
    $.each(data, function(index, obj) {
        if (obj.Value !== null && obj.Value !== 0) {
            row.append('<th scope="col" class="tblmainhdr">' + obj.Label.replace(/_/g, "<br>") + '</th>');
        }
    });
    return row;
}
