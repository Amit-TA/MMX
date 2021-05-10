$(document).ready(function () {
    $("#pageloaddiv").show();
    onInitialLoad();

});
var maxValue = 0;
var totalSpendValues = 0;
var compscrnID;
var margin_bar = 35;
var initialTooltipValue = 0;
var changedFormsID = [];
var optimchangevalue = 10;


function commaSeparatevalue(val) {
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val;
}

function commaSeparateNumber(val) {
    if (val !== 0) {
        val = round(val / 1000, 0);
    }
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val + "K";
}

// function commaSeparateNumberMillions(val) {
//     if (val !== 0) {
//         val = round(val / 1000000, 2);
//     }
//     while (/(\d+)(\d{3})/.test(val.toString())) {
//         val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
//     }
//     return val + "M";
// }

function commaSeparateNumberMillions(val) {
    // alert(val)
    if (val !== 0) {
        val = round(val / 1000, 0);
    }
    while (/(\d+)(\d{3})/.test(val.toString())) {
        val = val.toString().replace(/(\d+)(\d{3})/, '$1' + ',' + '$2');
    }
    return val + "K";
}

function splitjoin(str) {

    for (i = 0; i < str.length; i++) {
        str[i] = str[i].replace(/_/g, " ");
    }
    return str;

}

function round(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}



function Horizontalwrap(text, width) {

    text.each(function () {

        var breakChars = ['.', '/', '&', '-', '_', ' '],
            text = d3.select(this),
            textContent = text.text(),
            spanContent;

        breakChars.forEach(char => {
            // Add a space after each break char for the function to use to determine line breaks
            textContent = textContent.replace(char, char + ' ');
        });

        var words = textContent.split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.0, // ems
            x = text.attr('x'),
            y = text.attr('y'),
            dy = parseFloat(text.attr('dy') || 0),
            tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                spanContent = line.join(' ');
                breakChars.forEach(char => {
                    // Remove spaces trailing breakChars that were added above
                    spanContent = spanContent.replace(char + ' ', char);
                });
                tspan.text(spanContent);
                line = [word];
                tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
            }
        }
    });

}

function verticalWrap(text, width) {
    text.each(function () {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}


function onInitialLoad() {



    $.getJSON("./static/data/SliderData.json", function (data) {

        result = data[0];

        $.each(result, function (key, field) {
            field = round(field, 0);
            // if (!key.includes("PR")) {
            //     totalSpendValues += field;
            // }
            totalSpendValues += field;
            if (field > 0) {
                result[key] = round(field, 0);
                //alert(key+" - "+field);
                // if (!key.includes("PR")) {
                //     maxValue = maxValue < field ? field : maxValue;
                // }
                maxValue = maxValue < field ? field : maxValue;
                $("#scnrinptsfrm").append(getSliderHtml(key, field));
                $("#optimscnrupdatefrm").append(getoptimupdateSliderHtml(key, field));
                $("#scnroptiminptsfrm").append(getoptimBaseSliderhtml(key, field));
            } else {
                delete result[key];
            }
        });

        loadCategories(result);
        intialslidebar();
        intialoptimslidebar();
        initialSpendValues(totalSpendValues);
        addTooltips();
        optimchnage(optimchangevalue);
        $("#optimselctdropdown").val(optimchangevalue);
        $("#pageloaddiv").hide();
    });

    $.getJSON("./static/data/2015piedata.json", function (data) {
        // alert(data.length);
        pieresult = data;
        $.each(pieresult, function (key, field) {
            // alert(key + " - " + JSON.stringify(field));
            modalPieChart("optim_" + key + "_pie", field);
        });

    });

    $.getJSON("./static/data/basegroupbardata.json", function (data) {

        groupbarresult = data;
        // alert(JSON.stringify(groupbarresult));
        // optimalhistGroupedBarChart("optimhistbaseChart", groupbarresult);
        optimalhistgroupedhorizontalbarchart("optimhistbaseChart", groupbarresult);


    });



}


function updateOptimizationBar(optimdata, optimvalue) {

    $.each(optimdata, function (key, field) {
        // alert(key+"----"+field);
        key = key.replace(".", "_");
        key = key.replace(" ", "_");
        optimupdateBar("optim_chart_" + key, field);
    });

}

function addTooltips() {
    $('#infotip').tooltipster();
    $('#PR_infotip').tooltipster();
    $("#roi_infotip,#baseroi_infotip,#roi_infotip2").tooltipster({
        animation: 'fade',
        delay: 100,
        theme: 'tooltipster-punk',
        trigger: 'hover',
        maxWidth: 350
    });
}

function intialslidebar() {

    $(".sgmntslider").each(function () {
        if ($(this).attr("barValue") > 1000000) {

            $(this).slider({

                range: "min",
                value: 0,
                min: -10,
                max: +10,
                step: 1,
                create: sliderTooltip,
                slide: sliderTooltip,
                stop: function (event, ui) {
                    var sldid = ($(this).attr("id"));
                    slideCalc(sldid, ui.value);
                }
            }).slider("pips", {
                step: 10,
                rest: "label"
            }).on("slidechange", function (e, ui) {
                var sldid = ($(this).attr("id"));
                slideCalc(sldid, ui.value);
                // $("#labels-months-output").text("You selected " + ui.value);
            });



        } else {
            $(this).slider({

                range: "min",
                value: 0,
                min: -20,
                max: +20,
                step: 1,
                create: sliderTooltip,
                slide: sliderTooltip,
                stop: function (event, ui) {
                    var sldid = ($(this).attr("id"));
                    slideCalc(sldid, ui.value);
                }
            }).slider("pips", {
                step: 10,
                rest: "label"

            }).on("slidechange", function (e, ui) {
                var sldid = ($(this).attr("id"));
                slideCalc(sldid, ui.value);
                // $("#labels-months-output").text("You selected " + ui.value);
            });
        }

    });

    $("ul.scnrsegmntchart").each(function () {
        // alert(this.id);
        // len = parseInt(ww, 10) * parseInt(pc, 10) / 100;
        //alert(ww+" - "+len);
        var id = this.id;

        var jsonValue = $(this).find('li:nth-child(2)').attr('title');
        var pc = jsonValue / maxValue * 100;
        var ww = $(this).find('li:nth-child(2)').width() - margin_bar;
        len = parseFloat(ww) * parseFloat(pc) / 100;
        $(this).find('li:nth-child(2) .percent').html('$' + commaSeparateNumber(parseInt(jsonValue)));
        $(this).find('li:nth-child(1) .percent').html('$' + commaSeparateNumber(parseInt(jsonValue)));
        $(this).find('li').children('.bar').animate({
            'width': len + 'px'
        }, 250);
    });
}


function intialoptimslidebar() {
    // alert('Initial Loading.....');

    $(".sgmntoptimslider").each(function () {



        if ($(this).attr("barValue") > 1000000) {


            $(this).slider({

                range: true,
                min: -10,
                max: 10,
                values: [-10, 10],
                create: sliderTooltip,
                slide: sliderTooltip,
                stop: function (event, ui) {
                    var sldid = ($(this).attr("id"));
                    slideCalc(sldid, ui.value);
                }
            }).slider("pips", {
                step: 5,
                rest: "label"
            }).on("slidechange", function (e, ui) {
                var sldid = ($(this).attr("id"));
                slideCalc(sldid, ui.value);
                // $("#labels-months-output").text("You selected " + ui.value);
            });


        } else {
            $(this).slider({

                range: true,
                min: -10,
                max: 10,
                values: [-10, 10],
                create: sliderTooltip,
                slide: sliderTooltip,
                stop: function (event, ui) {
                    var sldid = ($(this).attr("id"));
                    slideCalc(sldid, ui.value);
                }
            }).slider("pips", {
                step: 5,
                rest: "label"

            }).on("slidechange", function (e, ui) {
                var sldid = ($(this).attr("id"));
                slideCalc(sldid, ui.value);
                // $("#labels-months-output").text("You selected " + ui.value);
            });
        }

    });

    $("ul.scnroptimsegmntchart").each(function () {

        console.log(this.id);

        var id = this.id;

        var jsonValue = $(this).find('li:nth-child(1)').attr('title');
        var pc = jsonValue / maxValue * 100;
        var ww = $(this).find('li:nth-child(1)').width() - margin_bar;
        len = parseFloat(ww) * parseFloat(pc) / 100;
        console.log(ww + " - " + len);
        $(this).find('li:nth-child(1) .percent').html('$' + commaSeparateNumber(parseInt(jsonValue)));
        // $(this).find('li:nth-child(1) .percent').html('$' + commaSeparateNumber(parseInt(jsonValue))).hide();
        $(this).find('li').children('.bar').animate({
            'width': len + 'px'
        }, 250);
    });
}

function getSliderHtml(input, data) {

    var htmlTemplate = '<div class="row margTB4"><div class="col-md-2 col-lg-2 nopadding"><p class="scnripItem">INPUT_VALUE_NAME</p></div><div class="col-md-4 col-lg-4 no-gutters"><div class="input-group"> <button type="button" class="btn btn-link" id="INPUT_VALUE_minus" onClick="decrement_click(this.id)"> <i class="fa fa-minus-circle" aria-hidden="true"></i> </button><div barValue="BAR_VALUE" class="sgmntslider" id="INPUT_VALUE"></div><button type="button" class="btn btn-link" id="INPUT_VALUE_plus" onClick="increment_click(this.id)"> <i class="fa fa-plus-circle" aria-hidden="true"></i> </button> <input class="form-control inputNumber" name="INPUT_VALUE" id="INPUT_VALUE_scnrprice" onchange="ipvalcheck(this.id)" type="numeric" value="0"> <span class="prcntdot"> <i class="fa fa-percent" aria-hidden="true"></i> </span></div></div><div class="col-md-6 col-lg-6"> <section class="chartwrapper"><ul id="chart_INPUT_VALUE" class="scnrsegmntchart progress_chart"><li title="80" class="newscn pgrsnewscn" id=""> <span class="bar"></span> <span class="percent"></span></li><li title="INPUT_DATA" class="base pgrsbase" id=""> <span class="bar"></span> <span class="percent"></span></li> </ul> </section></div></div>';

    htmlTemplate = htmlTemplate.replace("INPUT_VALUE_NAME", input);
    htmlTemplate = htmlTemplate.replace("BAR_VALUE", data);
    htmlTemplate = htmlTemplate.replace("INPUT_DATA", data);
    input = input.replace(".", "_");
    input = input.replace(" ", "_");

    return htmlTemplate.replace(/INPUT_VALUE/gi, input);
}

function getoptimBaseSliderhtml(input, data) {

    var htmlTemplate = '<div class="row margTB4"><div class="col-md-2 col-lg-2 nopadding"><p class="scnripItem">INPUT_VALUE_NAME</p></div><div class="col-md-4 col-lg-4 no-gutters"><div class="input-group"><div barValue="BAR_VALUE" class="sgmntoptimslider" id="INPUT_VALUE"></div></div></div><div class="col-md-6 col-lg-6"> <section class="chartwrapper"><ul id="chart_INPUT_VALUE" class="scnroptimsegmntchart Optimprogress_chart"><li title="INPUT_DATA" class="base pgrsbase" id=""> <span class="bar"></span> <span class="percent"></span></li></ul> </section></div></div>';

    htmlTemplate = htmlTemplate.replace("INPUT_VALUE_NAME", input);
    htmlTemplate = htmlTemplate.replace("BAR_VALUE", data);
    htmlTemplate = htmlTemplate.replace("INPUT_DATA", data);
    input = input.replace(".", "_");
    input = input.replace(" ", "_");

    return htmlTemplate.replace(/INPUT_VALUE/gi, input);
}

function getoptimupdateSliderHtml(input, data) {

    // var htmlTemplate = '<div class="row margTB4"><div class="col-md-4 col-lg-4 nopadding"><p class="scnripItem">INPUT_VALUE_NAME</p></div><div class="col-md-8 col-lg-8"> <section class="chartwrapper"><ul id="optim_chart_INPUT_VALUE" class="scnrsegmntchart progress_chart"><li title="" class="newscn pgrsnewscn" id=""> <span class="bar"></span> <span class="percent"></span></li><li title="OPTIM_INPUT_DATA" class="base pgrsbase" id=""> <span class="bar"></span> <span class="percent"></span></li></ul> </section></div></div>';
    var htmlTemplate = '<div class="row margTB4"><div class="col-md-2 col-lg-2 nopadding"><p class="scnripItem">INPUT_VALUE_NAME</p></div><div class="col-md-1 col-lg-1"><div class="input-group"> <input class="form-control inputNumber optiminputNumber" name="INPUT_VALUE" id="optim_chart_INPUT_VALUE" type="numeric" value=""> <span class="prcntdot"> <i class="fa fa-percent" aria-hidden="true"></i> </span></div></div><div class="col-md-9 col-lg-9"> <section class="chartwrapper"><ul id="optim_chart_INPUT_VALUE" class="scnrsegmntchart progress_chart"><li title="" class="newscn pgrsnewscn" id=""> <span class="bar"></span> <span class="percent"></span></li><li title="OPTIM_INPUT_DATA" class="base pgrsbase" id=""> <span class="bar"></span> <span class="percent"></span></li></ul> </section></div></div>';

    htmlTemplate = htmlTemplate.replace("INPUT_VALUE_NAME", input);
    // htmlTemplate = htmlTemplate.replace("BAR_VALUE", data);
    htmlTemplate = htmlTemplate.replace("OPTIM_INPUT_DATA", data);
    // htmlTemplate = htmlTemplate.replace("INPUT_DATA", data);

    input = input.replace(".", "_");
    input = input.replace(" ", "_");

    return htmlTemplate.replace(/INPUT_VALUE/gi, input);
}


function slideCalc(sldid, sliderCurrentValue) {
    var sliderCurrentValue = parseInt(sliderCurrentValue);
    $("#" + sldid + "_scnrprice").val(sliderCurrentValue);

    updateTooltip(sldid, sliderCurrentValue);
    updateBar("chart_" + sldid, sliderCurrentValue);

    if (parseInt(sldid.split('_')[1]) > 0) {
        updateSpendValues(parseInt(sldid.split('_')[1])); /// assumption that id has only one $ symbol since we are appendingin;
    } else {
        updateSpendValues(undefined); // to identify main page
    }

}


function ipvalcheck(ip_id) {
    // alert(ip_id);
    var pattn = /-?\b(\d|1[0])\b/;
    var tick = $("#" + ip_id).val();
    if (pattn.test(tick)) {
        var ipsid = ip_id.replace("_scnrprice", "");
        $("#" + ipsid).slider("value", tick);
        slideCalc(ipsid, tick);
    } else {
        alert("Value should be between -10 To +10");
        $("#" + ip_id).val(0);
    }
}


function increment_click(clicked_id) {

    var sid = clicked_id.replace("_plus", "");
    // alert(sid);
    var sliderCurrentValue = $("#" + sid).slider("option", "value");
    // alert(sliderCurrentValue);
    $("#" + sid).slider("value", sliderCurrentValue + 1);

    sliderCurrentValue = $("#" + sid).slider("option", "value");
    slideCalc(sid, sliderCurrentValue);

}


function decrement_click(clicked_id) {
    var sid = clicked_id.replace("_minus", "");
    //alert(sid);
    var sliderCurrentValue = $("#" + sid).slider("option", "value");
    $("#" + sid).slider("value", sliderCurrentValue - 1);
    sliderCurrentValue = $("#" + sid).slider("option", "value");
    slideCalc(sid, sliderCurrentValue);
}



var sliderTooltip = function (event, ui) {
    var curValue = ui.value || initialTooltipValue;
    // alert('curntval....' + curValue);

    var target = $(event.target).attr("id");
    //alert('target...'+target);
    var tooltip = '<div class="tooltip"><div class="tooltip-inner">' + curValue + '</div></div>';

    // $('.ui-slider-handle').html(tooltip);
    $('#' + target + ' ' + '.ui-slider-handle').html(tooltip);

}

function updateTooltip(tid, tvalue) {
    var tooltip = '<div class="tooltip"><div class="tooltip-inner">' + tvalue + '</div></div>';
    // $('.ui-slider-handle').html(tooltip);
    $('#' + tid + ' .ui-slider-handle').html(tooltip);
}



function isChanged(formData) {
    var total = 0;
    // compscrnID = selectedId.split('_')[2];
    for (var i = 0; i < formData.length; i++) {
        total += parseInt(formData[i].value);
    }
    // alert("total : " + total);
    // alert('compscrnID>>>>::'+compscrnID);
    if (total == 0) {
        return false;
    } else {
        return true;
    }
}

function initialSpendValues(total) {
    $("#newScenarioSpendValue").html("$ " + commaSeparateNumber(total));
    $("#baseScenarioSpendValue").html("$ " + commaSeparateNumber(total));
    $("#comparebasespendvalue").html("$ " + commaSeparateNumber(total));
    $("#baseScenarioSpendChangePercent").html("(0 %)");
}


function getChangedScenarioForms() {

    var finalArray = [];
    $("form[name='scenariocompareinpt_form']").each(function (i) {
        var scnrfrmID = $(this).attr("id").split("_")[2];
        // alert('scnrfrmID>>' + scnrfrmID);
        var compformdata = $(this).serializeArray();
        if (isChanged(compformdata)) {
            changedFormsID.push(scnrfrmID);
            finalArray = finalArray.concat(compformdata);
        }

    });
    return finalArray;
}



function optimalhistgroupedhorizontalbarchart(appendAt, plotdata) {
    // alert("Booking Cont HBC:"+plotdata);
    // alert("Booking Cont HBC append:"+appendAt);
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

    var z = d3.scaleOrdinal()
        .range(["#F77C05", "#B4BAB8", "#4682B4"]);

    //var divTooltip = d3.select("body").append("div").attr("class", "toolTip");

    var data = plotdata;

    // alert(JSON.stringify(data[1]));
    $(data).each(function (i, d) {
        var temp = JSON.parse(JSON.stringify(d, ["Label", "2015", "2016", "2017"]));
        data[i] = temp;
    });
    // alert("after : " + JSON.stringify(data));

    // var filtered = data.filter(function (d) {
    //     return d.Base_Scenario > 0;
    // });
    // data = filtered;
    data = data.reverse();

    var n = data.length / 2;
    var itemWidth = 150;
    var itemHeight = 18;

    var scnrpercents = d3.keys(data[0]).filter(function (key) {
        return key !== "Label";
    });

    data.forEach(function (d) {
        d.itempercents = scnrpercents.map(function (name) {
            return {
                name: name,
                value: +d[name]
            };
        });
    });

    y0.domain(data.map(function (d) {
        return d.Label;
    }));
    y1.domain(scnrpercents).rangeRound([0, y0.bandwidth()]);
    x.domain([0, d3.max(data, function (d) {
        return d3.max(d.itempercents, function (d) {
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
        .attr("transform", function (d) {
            return "translate( 0," + y0(d.Label) + ")";
        });

    var bar_enter = bar.selectAll("rect")
        .data(function (d) {
            return d.itempercents;
        })
        .enter();


    bar_enter.append("rect")
        .attr("height", y1.bandwidth())
        .attr("y", function (d) {
            return y1(d.name);
        })
        .attr("x", function (d) {
            return 0;
        })
        .attr("value", function (d) {
            return d.name;
        })
        .attr("width", function (d) {
            return x(d.value);
        })
        .style("fill", function (d) {
            return z(d.name);
        });

    bar_enter.append("text")
        .attr("class", "histbarstext")
        .attr("x", function (d) {
            return x(d.value) + 5;
        })
        .attr("y", function (d) {
            return y1(d.name) + (y1.bandwidth() / 2);
        })

        .attr("dy", ".35em")
        .text(function (d) {
            return formatpercentValue(d.value / 100);
        });

    var legendGroup = svg.append("g")
        .attr("transform", "translate(" + (width - 250) + ",-10)");

    var legend = legendGroup.selectAll(".legend")
        .data(splitjoin(scnrpercents.slice()))
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(" + i % n * (itemWidth - 40) + "," + Math.floor(i / n) * itemHeight + ")";
        });


    var rects = legend.append('rect')
        .attr("width", 16)
        .attr("height", 16)
        .attr("fill", function (d, i) {
            return z(i);
        });

    var text = legend.append('text')
        .attr("x", 15)
        .attr("y", 12)
        .attr("dx", ".45em")
        .attr("dy", ".15em")
        .style("text-anchor", "start")
        .text(function (d) {
            return d;
        });


}

function optimchnage(optval) {
    // alert(optval);
    // alert(totalSpendValues);
    var optimnewspendval;

    var changeValuePositiveHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-up green" aria-hidden="true"></i>';
    var changeValueNegativeHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-down red" aria-hidden="true"></i>';

    if (optval == 5) {
        optimnewspendval = totalSpendValues * 1.05;
        optimintialchngepercent = optimnewspendval - totalSpendValues;
        // alert("spend val :" + optimnewspendval);
        // alert("cahnge:" + optimintialchngepercent);
        $("#optimislctnewScenarioSpendValue").html("$ " + commaSeparateNumber(optimnewspendval));
        $("#optimislctbaseScenarioSpendChange").html("$ " + commaSeparateNumber(optimintialchngepercent));
        if (optimintialchngepercent == 0) {
            $("#optimislctbaseScenarioSpendChange").html("0");
        } else {
            $("#optimislctbaseScenarioSpendChange").html(optimintialchngepercent >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparateNumber(round(optimintialchngepercent, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparateNumber(round(optimintialchngepercent, 0))));
        }
        $("#optimislctbaseScenarioSpendChangePercent").html("(" + optval + " %)");
    } else {
        optimnewspendval = totalSpendValues * 1.1;
        optimintialchngepercent = optimnewspendval - totalSpendValues;
        $("#optimislctnewScenarioSpendValue").html("$ " + commaSeparateNumber(optimnewspendval));
        $("#optimislctbaseScenarioSpendChange").html("$ " + commaSeparateNumber(optimintialchngepercent));
        if (optimintialchngepercent == 0) {
            $("#optimislctbaseScenarioSpendChange").html("0");
        } else {
            $("#optimislctbaseScenarioSpendChange").html(optimintialchngepercent >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparateNumber(round(optimintialchngepercent, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparateNumber(round(optimintialchngepercent, 0))));
        }
        $("#optimislctbaseScenarioSpendChangePercent").html("(" + optval + " %)");
    }



}


$(document).ready(function () {



    function optimalmodalGroupedRoiBarChart(appendAt, plotData) {
        // alert('inoptimchart');
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

        var filtered = data.filter(function (d) {
            return d.Base_Scenario > 0;
        });
        data = filtered;
        var scnrpercents = d3.keys(data[0]).filter(function (key) {
            return key !== "Label";
        });

        data.forEach(function (d) {
            d.itempercents = scnrpercents.map(function (name) {
                return {
                    name: name,
                    // value: +d[name]
                    value: d[name] > 70 ? 70 : +d[name],
                    displayValue: +d[name]
                };

            });
        });
        // alert('ValData==>' + JSON.stringify(data));
        x0.domain(data.map(function (d) {
            return d.Label;
        }));
        x1.domain(scnrpercents).rangeRound([0, x0.bandwidth()]);
        y.domain([0, d3.max(data, function (c) {
            return d3.max(c.itempercents, function (d) {
                // alert('Data==>' + JSON.stringify(c.itempercents));
                var filtered = c.itempercents.filter(function (d) {
                    return d.value > 0;
                });

                return d.value;
            });
        })]);

        // var formatpercentValue = d3.format(".1%");
        // alert('2Data==>' + JSON.stringify(data));
        svg.append("g")
            .selectAll("g")
            .data(data)
            .enter().append("g")
            .attr("transform", function (d) {
                return "translate(" + x0(d.Label) + ",0)";
            })
            .selectAll("rect")
            // .data(data)
            .data(function (d) {
                return d.itempercents;
            })
            .enter().append("rect")
            .attr("class", "adi")
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
            .attr("transform", "rotate(-20)")
            .attr("x", function (d, i) {
                return ((x1(d.name) + (x1.bandwidth() / 2) - 5) * Math.cos(-20 * Math.PI / 180) + (y(d.value) - 2) * Math.sin(-20 * Math.PI / 180));
            })
            .attr("y", function (d) {
                return (-(x1(d.name) + (x1.bandwidth() / 2) - 5) * Math.sin(-20 * Math.PI / 180) + (y(d.value) - 2) * Math.cos(-20 * Math.PI / 180));
            })
            //.attr("dx", ".35em")
            .text(function (d) {
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
                return d;
            });

    }




    function modalPieChart(appendAt, plotdata) {
        // alert('piechart');
        // alert('piechart FormData: '+JSON.stringify(plotdata));

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
            .value(function (d) {
                return d.Value;
            });

        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var label = d3.arc()
            .outerRadius(radius - 100)
            .innerRadius(radius - 100);

        //var f = JSON.stringify([{value1: value1, value2: value2, value3:value3}]);
        var data = plotdata;


        // alert('piedata main data::'+JSON.stringify(data));
        var arc = g.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        arc.append("path")
            .attr("d", path)
            .attr("fill", function (d) {
                return color(d.data.BookingCat);
            });

        arc.append("text")
            .attr("transform", function (d) {
                return "translate(" + label.centroid(d) + ")";
            })
            // .attr("dx", "3em")
            // .attr("dy", "0.85em")
            .attr("text-anchor", "middle")
            .attr("class", "piearctxt")
            .style("fill", "#ffffff")
            //.style("font", "bold 0.89vw Arial")
            .text(function (d) {
                return d.data.BookingCat;
            });


    }

    function optimalmodalgroupedhorizontalbarchart(appendAt, plotdata) {
        // alert("Booking Cont HBC:"+plotdata);
        // alert("Booking Cont HBC append:"+appendAt);
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
            .attr("transform", "translate(" + margin.left  + "," + margin.top + ")");


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
        $(data).each(function (i, d) {
            var temp = JSON.parse(JSON.stringify(d, ["Label", "Optimized_Scenario", "Base_Scenario"]));
            data[i] = temp;
        });
        // alert("after : " + JSON.stringify(data));

        var filtered = data.filter(function (d) {
            return d.Base_Scenario > 0;
        });
        data = filtered;
        data = data.reverse();

        var n = data.length / 2;
        var itemWidth = 150;
        var itemHeight = 18;

        var scnrpercents = d3.keys(data[0]).filter(function (key) {
            return key !== "Label";
        });

        data.forEach(function (d) {
            d.itempercents = scnrpercents.map(function (name) {
                return {
                    name: name,
                    value: +d[name]
                };
            });
        });

        y0.domain(data.map(function (d) {
            return d.Label;
        }));
        y1.domain(scnrpercents).rangeRound([0, y0.bandwidth()]);
        x.domain([0, d3.max(data, function (d) {
            return d3.max(d.itempercents, function (d) {
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
            .attr("transform", function (d) {
                return "translate( 0," + y0(d.Label) + ")";
            });

        var bar_enter = bar.selectAll("rect")
            .data(function (d) {
                return d.itempercents;
            })
            .enter();


        bar_enter.append("rect")
            .attr("height", y1.bandwidth())
            .attr("y", function (d) {
                return y1(d.name);
            })
            .attr("x", function (d) {
                return 0;
            })
            .attr("value", function (d) {
                return d.name;
            })
            .attr("width", function (d) {
                return x(d.value);
            })
            .style("fill", function (d) {
                return z(d.name);
            });

        bar_enter.append("text")
            .attr("class", "barstext")
            .attr("x", function (d) {
                return x(d.value) + 5;
            })
            .attr("y", function (d) {
                return y1(d.name) + (y1.bandwidth() / 2);
            })

            .attr("dy", ".35em")
            .text(function (d) {
                return formatpercentValue(d.value / 100);
            });

        var legendGroup = svg.append("g")
            .attr("transform", "translate(" + (width - 250) + ",-10)");

        var legend = legendGroup.selectAll(".legend")
            .data(splitjoin(scnrpercents.slice()))
            .enter()
            .append("g")
            .attr("class", "legend")
            .attr("transform", function (d, i) {
                return "translate(" + i % n * itemWidth + "," + Math.floor(i / n) * itemHeight + ")";
            });


        var rects = legend.append('rect')
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", function (d, i) {
                return z(i);
            });

        var text = legend.append('text')
            .attr("x", 15)
            .attr("y", 12)
            .attr("dx", ".45em")
            .attr("dy", ".15em")
            .style("text-anchor", "start")
            .text(function (d) {
                return d;
            });


    }


    $("#runoptimscenario").click(function () {

        // alert('runoptimscenario');



        $("#pageloaddiv").show();
        $(document).scrollTop(0);
        $(".optimscnarcntmainhdr").hide();
        $(".optimscnarcntmainhdrrslts").show();
        $("#optimscnripBox").hide();
        $("#optimscnrrsltBox").slideDown("600", function () {
            $(".btn-celebrity").hide();
            // $("#pageloaddiv").show();
        });


        $("#countrydropdown").change(function () {
            //alert("change")
            var value1 = $("#productdropdown option:selected").text();
            var value2 = $("#channeldropdown option:selected").text();
            var value3 = $("#countrydropdown option:selected").text();
            if (value1 == 'Product 1') {
                value1 = 'Alaska';
            }
            if (value1 == 'Product 2') {
                value1 = 'Bermuda';
            }
            if (value1 == 'Product 3') {
                value1 = 'Caribbean';
            }
            if (value1 == 'Product 4') {
                value1 = 'Europe';
            }
            if (value1 == 'Product 5') {
                value1 = 'Long Caribbean';
            }
            // var formData = $("#scnrinptsfrm").serializeArray();
            var data = {
                value1: value1,
                value2: value2,
                value3: value3
            };
            $("#pageloaddiv").show();
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "optimaldatafunc_2",
                data: JSON.stringify(data),
                success: function (updatedresp) {
                    // alert(updatedresp)
                    var optimbookingschangeval = updatedresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings - updatedresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings;
                    $("#optimbooktabnewscnrbookonslct").html(commaSeparateNumber(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings));
                    $("#optimbooktabbasescnrbookonslct").html(commaSeparateNumber(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings));
                    if (optimbookingschangeval == 0) {
                        $("#optimbooktabchnginspndonslct").html("0");
                    } else {
                        $("#optimbooktabchnginspndonslct").html(optimbookingschangeval >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))));
                    }
                    $("#optimbooktabchnginspndonslctprcnt").html("(" + round(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimchangeInBooingsPercent, 0) + " %)");
                    var appendTo = "optimscnrrsltpieChartBase";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.basePieChart;
                    // alert("PlotData before: "+plotdata);
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    modalPieChart(appendTo, plotdata);

                    var appendTo = "optimscnrrsltpieChart";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.newPieChart;
                    // alert("PlotData before: "+plotdata);
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    modalPieChart(appendTo, plotdata);

                    var appendTo = "optimincrmtblowChart";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.groupedContributionChart;
                    // alert("PlotData orizontal before: "+JSON.stringify(plotdata));
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    optimalmodalgroupedhorizontalbarchart(appendTo, plotdata);
                    $("#pageloaddiv").hide();
                },

                dataType: "json"
            });


            //alert(JSON.stringify([{value1: value1, value2: value2, value3:value3}]));
            d3.select("#scnrrsltpieChart").selectAll("svg").remove();
            d3.select("#scnrrsltpieChartBase").selectAll("svg").remove();
            //alert("removed plot")
            scnrrsltpie(value1, value2, value3, formData);
            scnrrsltpieBase(value1, value2, value3, formData);
            d3.select("#incrmtblowChart").selectAll("svg").remove();
            //alert('Forma Data::'+JSON.stringify(formData));
            groupedhorizontalbarchart(value1, value2, value3, formData);
            newscenariovaluechange(value1, value2, value3, formData);

            if (this.value == '3') {
                $("#channeldropdown option[value='3']").hide();

            } else {


                $("#channeldropdown option[value='3']").show();

            }
        });

        $("#productdropdown").change(function () {
            var value1 = $("#productdropdown option:selected").text();
            var value2 = $("#channeldropdown option:selected").text();
            var value3 = $("#countrydropdown option:selected").text();
            var formData = $("#scnrinptsfrm").serializeArray();
            if (value1 == 'Product 1') {
                value1 = 'Alaska';
            }
            if (value1 == 'Product 2') {
                value1 = 'Bermuda';
            }
            if (value1 == 'Product 3') {
                value1 = 'Caribbean';
            }
            if (value1 == 'Product 4') {
                value1 = 'Europe';
            }
            if (value1 == 'Product 5') {
                value1 = 'Long Caribbean';
            }
            var data = {
                value1: value1,
                value2: value2,
                value3: value3
            };
            $("#pageloaddiv").show();
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "optimaldatafunc_2",
                data: JSON.stringify(data),
                success: function (updatedresp) {
                    // alert(updatedresp)
                    var optimbookingschangeval = updatedresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings - updatedresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings;
                    $("#optimbooktabnewscnrbookonslct").html(commaSeparateNumber(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings));
                    $("#optimbooktabbasescnrbookonslct").html(commaSeparateNumber(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings));
                    if (optimbookingschangeval == 0) {
                        $("#optimbooktabchnginspndonslct").html("0");
                    } else {
                        $("#optimbooktabchnginspndonslct").html(optimbookingschangeval >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))));
                    }
                    $("#optimbooktabchnginspndonslctprcnt").html("(" + round(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimchangeInBooingsPercent, 0) + " %)");
                    var appendTo = "optimscnrrsltpieChartBase";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.basePieChart;
                    // alert("PlotData before: "+plotdata);
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    modalPieChart(appendTo, plotdata);

                    var appendTo = "optimscnrrsltpieChart";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.newPieChart;
                    // alert("PlotData before: "+plotdata);
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    modalPieChart(appendTo, plotdata);

                    var appendTo = "optimincrmtblowChart";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.groupedContributionChart;
                    // alert("PlotData orizontal before: "+JSON.stringify(plotdata));
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    optimalmodalgroupedhorizontalbarchart(appendTo, plotdata);
                    $("#pageloaddiv").hide();
                },

                dataType: "json"
            });
            //alert(JSON.stringify([{value1: value1, value2: value2, value3:value3}]));
            d3.select("#scnrrsltpieChart").selectAll("svg").remove();
            d3.select("#scnrrsltpieChartBase").selectAll("svg").remove();

            //alert("removed plot")
            scnrrsltpie(value1, value2, value3, formData);
            scnrrsltpieBase(value1, value2, value3, formData);
            //alert("removed bar plot")
            d3.select("#incrmtblowChart").selectAll("svg").remove();
            groupedhorizontalbarchart(value1, value2, value3, formData);
            newscenariovaluechange(value1, value2, value3, formData);
        });

        $("#channeldropdown").change(function () {
            var value1 = $("#productdropdown option:selected").text();
            var value2 = $("#channeldropdown option:selected").text();
            var value3 = $("#countrydropdown option:selected").text();
            if (value1 == 'Product 1') {
                value1 = 'Alaska';
            }
            if (value1 == 'Product 2') {
                value1 = 'Bermuda';
            }
            if (value1 == 'Product 3') {
                value1 = 'Caribbean';
            }
            if (value1 == 'Product 4') {
                value1 = 'Europe';
            }
            if (value1 == 'Product 5') {
                value1 = 'Long Caribbean';
            }
            var data = {
                value1: value1,
                value2: value2,
                value3: value3
            };
            $("#pageloaddiv").show();
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "optimaldatafunc_2",
                data: JSON.stringify(data),
                success: function (updatedresp) {
                    // alert(updatedresp)
                    var optimbookingschangeval = updatedresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings - updatedresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings;
                    $("#optimbooktabnewscnrbookonslct").html(commaSeparateNumber(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings));
                    $("#optimbooktabbasescnrbookonslct").html(commaSeparateNumber(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings));
                    if (optimbookingschangeval == 0) {
                        $("#optimbooktabchnginspndonslct").html("0");
                    } else {
                        $("#optimbooktabchnginspndonslct").html(optimbookingschangeval >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))));
                    }
                    $("#optimbooktabchnginspndonslctprcnt").html("(" + round(updatedresp.TabData.contributionTabData.contributionTabBoxData.optimchangeInBooingsPercent, 0) + " %)");
                    var appendTo = "optimscnrrsltpieChartBase";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.basePieChart;
                    // alert("PlotData before: "+plotdata);
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    modalPieChart(appendTo, plotdata);

                    var appendTo = "optimscnrrsltpieChart";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.newPieChart;
                    // alert("PlotData before: "+plotdata);
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    modalPieChart(appendTo, plotdata);

                    var appendTo = "optimincrmtblowChart";
                    var plotdata = updatedresp.TabData.contributionTabData.contributionTabChartData.groupedContributionChart;
                    // alert("PlotData orizontal before: "+JSON.stringify(plotdata));
                    d3.select("#" + appendTo).selectAll("svg").remove();
                    optimalmodalgroupedhorizontalbarchart(appendTo, plotdata);
                    $("#pageloaddiv").hide();
                },

                dataType: "json"
            });
            // var formData = $("#scnrinptsfrm").serializeArray();
            //alert(JSON.stringify([{value1: value1, value2: value2, value3:value3}]));
            d3.select("#optimscnrrsltpieChart").selectAll("svg").remove();
            d3.select("#optimscnrrsltpieChartBase").selectAll("svg").remove();
            //alert("removed plot")
            scnrrsltpie(value1, value2, value3, formData);
            scnrrsltpieBase(value1, value2, value3, formData);
            d3.select("#optimincrmtblowChart").selectAll("svg").remove();
            groupedhorizontalbarchart(value1, value2, value3, formData);
            // newscenariovaluechange(value1, value2, value3, formData);

            if (this.value == '3') {
                $("#countrydropdown option[value='3']").hide();
            } else {
                $("#countrydropdown option[value='3']").show();

            }
        });

        var optimslctvalue = $("#optimselctdropdown :selected").text();
        // var value2 = $("#channeldropdown option:selected").text();
        // var value3 = $("#countrydropdown option:selected").text();
        // alert(optimslctvalue);


        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "storeformdata_optimal",
            data: JSON.stringify(optimslctvalue),
            success: function (optimresp) {
                // alert(JSON.stringify(optimresp));
                // alert(JSON.stringify(optimresp.TabData.contributionTabData.contributionTabChartData.basePieChart));

                var changeValuePositiveHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-up green" aria-hidden="true"></i>';
                var changeValueNegativeHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-down red" aria-hidden="true"></i>';

                var optimscenariochangeval = optimresp.TabData.spendTabData.optimmarketnewSpend - optimresp.TabData.spendTabData.optimmarketbaseSpend;
                var optimbookingschangeval = optimresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings - optimresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings;
                var optimroichangeval = optimresp.TabData.roiTabData.roiTabBoxData.optimnewROI - optimresp.TabData.roiTabData.roiTabBoxData.optimbaseROI;

                // alert(optimscenariochangeval);
                $("#optimnewScenarioSpendValue").html("$ " + commaSeparateNumber(optimresp.TabData.spendTabData.optimmarketnewSpend));
                $("#optimbaseScenarioSpendValue").html("$ " + commaSeparateNumber(optimresp.TabData.spendTabData.optimmarketbaseSpend));
                // $("#optimbaseScenarioSpendChange").html("$ " + commaSeparateNumber(optimresp.TabData.spendTabData.optimmarketchangeSpend));
                if (optimscenariochangeval == 0) {
                    $("#optimbaseScenarioSpendChange").html("0");
                } else {
                    $("#optimbaseScenarioSpendChange").html(optimscenariochangeval >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparateNumber(round(optimscenariochangeval, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparateNumber(round(optimscenariochangeval, 0))));
                }
                $("#optimbaseScenarioSpendChangePercent").html("(" + round(optimresp.TabData.spendTabData.optimmarketchangeSpendPercent, 0) + " %)");

                $("#optimnewscnrbookonslct").html(commaSeparateNumber(optimresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings));
                $("#optimbasescnrbookonslct").html(commaSeparateNumber(optimresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings));
                // $("#optimchnginspndonslct").html(commaSeparateNumber(optimresp.TabData.contributionTabData.optimchangeInBooings));
                if (optimbookingschangeval == 0) {
                    $("#optimchnginspndonslct").html("0");
                } else {
                    $("#optimchnginspndonslct").html(optimbookingschangeval >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))));
                }
                $("#optimchnginspndonslctprcnt").html("(" + round(optimresp.TabData.contributionTabData.contributionTabBoxData.optimchangeInBooingsPercent, 0) + " %)");

                $("#optimroinewscrnspnd").html("$ " + commaSeparatevalue(optimresp.TabData.roiTabData.roiTabBoxData.optimnewROI));
                $("#optimroinewscrnbasespnd").html("$ " + commaSeparatevalue(optimresp.TabData.roiTabData.roiTabBoxData.optimbaseROI));
                // $("#optimroichnginspnd").html("$ " + commaSeparatevalue(round(optimresp.TabData.roiTabData.roiTabBoxData.optimchangeROI, 2))); 
                if (optimroichangeval == 0) {
                    $("#optimroichnginspnd").html("0");
                } else {
                    $("#optimroichnginspnd").html(optimroichangeval >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(optimroichangeval, 2))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(optimroichangeval, 2))));
                }
                $("#optimroichnginspndprcnt").html("(" + round(optimresp.TabData.roiTabData.roiTabBoxData.optimchangeROIPercent, 0) + " %)");
                $("#optimbooktabnewscnrbookonslct").html(commaSeparateNumber(optimresp.TabData.contributionTabData.contributionTabBoxData.optimnewBookings));
                $("#optimbooktabbasescnrbookonslct").html(commaSeparateNumber(optimresp.TabData.contributionTabData.contributionTabBoxData.optimbaseBookings));
                if (optimbookingschangeval == 0) {
                    $("#optimbooktabchnginspndonslct").html("0");
                } else {
                    $("#optimbooktabchnginspndonslct").html(optimbookingschangeval >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparateNumber(round(optimbookingschangeval, 0))));
                }
                $("#optimbooktabchnginspndonslctprcnt").html("(" + round(optimresp.TabData.contributionTabData.contributionTabBoxData.optimchangeInBooingsPercent, 0) + " %)");
                // alert(JSON.stringify(optimresp.TabData.roiTabData.roiTabBoxData.optimnewROI));
                $("#optimroitabnewscrnspnd").html("$ " + commaSeparatevalue(optimresp.TabData.roiTabData.roiTabBoxData.optimnewROI));
                $("#optimroitabnewscrnbasespnd").html("$ " + commaSeparatevalue(optimresp.TabData.roiTabData.roiTabBoxData.optimbaseROI));
                // $("#optimroichnginspnd").html("$ " + commaSeparatevalue(round(optimresp.TabData.roiTabData.roiTabBoxData.optimchangeROI, 2))); 
                if (optimroichangeval == 0) {
                    $("#optimroitabroichnginspnd").html("0");
                } else {
                    $("#optimroitabroichnginspnd").html(optimroichangeval >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + commaSeparatevalue(round(optimroichangeval, 2))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(optimroichangeval, 2))));
                }
                $("#optimroitabroichnginspndprcnt").html("(" + round(optimresp.TabData.roiTabData.roiTabBoxData.optimchangeROIPercent, 0) + " %)");

                $("#pageloaddiv").hide();




                var appendTo = "optimscnrrsltpieChartBase";
                var plotdata = optimresp.TabData.contributionTabData.contributionTabChartData.basePieChart;
                // alert("PlotData before: "+plotdata);
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);

                var appendTo = "optimscnrrsltpieChart";
                var plotdata = optimresp.TabData.contributionTabData.contributionTabChartData.newPieChart;
                // alert("PlotData before: "+plotdata);
                d3.select("#" + appendTo).selectAll("svg").remove();
                modalPieChart(appendTo, plotdata);

                var appendTo = "optimincrmtblowChart";
                var plotdata = optimresp.TabData.contributionTabData.contributionTabChartData.groupedContributionChart;
                // alert("PlotData orizontal before: "+JSON.stringify(plotdata));
                d3.select("#" + appendTo).selectAll("svg").remove();
                optimalmodalgroupedhorizontalbarchart(appendTo, plotdata);

                var appendTo = "optimroibaseChart";
                var plotdata = optimresp.TabData.roiTabData.roiTabChartData.groupedContributionChart;
                // alert("PlotData orizontal before: "+JSON.stringify(plotdata));
                d3.select("#" + appendTo).selectAll("svg").remove();
                optimalmodalGroupedRoiBarChart(appendTo, plotdata);


                updateOptimizationBar(optimresp.optimdata, optimslctvalue);



            },

            dataType: "json"
        });

    });


    $("#runscenario").click(function () {
        $("#pageloaddiv").show();
        $(document).scrollTop(0);
        $(".scnarcntmainhdr").hide();
        $(".scnarcntmainhdrrslts").show();
        $("#scnripBox").hide();
        $("#scnrrsltBox").slideDown("600", function () {
            $(".btn-celebrity").hide();
            $("#pageloaddiv").show();
        });

        var value1 = $("#productdropdown option:selected").text();
        var value2 = $("#channeldropdown option:selected").text();
        var value3 = $("#countrydropdown option:selected").text();
        if (value1 == 'Product 1') {
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2') {
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3') {
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4') {
            value1 = 'Europe';
        }
        if (value1 == 'Product 5') {
            value1 = 'Long Caribbean';
        }
        // var formData = JSON.stringify($("#scnrinptsfrm").serializeArray());
        var formData = $("#scnrinptsfrm").serializeArray();
        //alert(JSON.stringify(formData));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "storeformdata",
            data: JSON.stringify(formData),
            success: function (resp) {
                //alert(resp)
                scnrrsltpie(value1, value2, value3, formData);
                scnrrsltpieBase(value1, value2, value3, formData);
                groupedhorizontalbarchart(value1, value2, value3, formData);
                newscenariovaluechange(value1, value2, value3, formData);
                $("#pageloaddiv").hide();
            },

            dataType: "json"
        });

    });

    $("#countrydropdown").change(function () {
        //alert("change")
        var value1 = $("#productdropdown option:selected").text();
        var value2 = $("#channeldropdown option:selected").text();
        var value3 = $("#countrydropdown option:selected").text();
        if (value1 == 'Product 1') {
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2') {
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3') {
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4') {
            value1 = 'Europe';
        }
        if (value1 == 'Product 5') {
            value1 = 'Long Caribbean';
        }
        var formData = $("#scnrinptsfrm").serializeArray();
        //alert(JSON.stringify([{value1: value1, value2: value2, value3:value3}]));
        d3.select("#scnrrsltpieChart").selectAll("svg").remove();
        d3.select("#scnrrsltpieChartBase").selectAll("svg").remove();
        //alert("removed plot")
        scnrrsltpie(value1, value2, value3, formData);
        scnrrsltpieBase(value1, value2, value3, formData);
        d3.select("#incrmtblowChart").selectAll("svg").remove();
        //alert('Forma Data::'+JSON.stringify(formData));
        groupedhorizontalbarchart(value1, value2, value3, formData);
        newscenariovaluechange(value1, value2, value3, formData);

        if (this.value == '3') {
            $("#channeldropdown option[value='3']").hide();

        } else {


            $("#channeldropdown option[value='3']").show();

        }
    });

    $("#productdropdown").change(function () {
        var value1 = $("#productdropdown option:selected").text();
        var value2 = $("#channeldropdown option:selected").text();
        var value3 = $("#countrydropdown option:selected").text();
        var formData = $("#scnrinptsfrm").serializeArray();
        if (value1 == 'Product 1') {
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2') {
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3') {
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4') {
            value1 = 'Europe';
        }
        if (value1 == 'Product 5') {
            value1 = 'Long Caribbean';
        }
        //alert(JSON.stringify([{value1: value1, value2: value2, value3:value3}]));
        d3.select("#scnrrsltpieChart").selectAll("svg").remove();
        d3.select("#scnrrsltpieChartBase").selectAll("svg").remove();

        //alert("removed plot")
        scnrrsltpie(value1, value2, value3, formData);
        scnrrsltpieBase(value1, value2, value3, formData);
        //alert("removed bar plot")
        d3.select("#incrmtblowChart").selectAll("svg").remove();
        groupedhorizontalbarchart(value1, value2, value3, formData);
        newscenariovaluechange(value1, value2, value3, formData);
    });

    $("#channeldropdown").change(function () {
        var value1 = $("#productdropdown option:selected").text();
        var value2 = $("#channeldropdown option:selected").text();
        var value3 = $("#countrydropdown option:selected").text();
        if (value1 == 'Product 1') {
            value1 = 'Alaska';
        }
        if (value1 == 'Product 2') {
            value1 = 'Bermuda';
        }
        if (value1 == 'Product 3') {
            value1 = 'Caribbean';
        }
        if (value1 == 'Product 4') {
            value1 = 'Europe';
        }
        if (value1 == 'Product 5') {
            value1 = 'Long Caribbean';
        }
        var formData = $("#scnrinptsfrm").serializeArray();
        //alert(JSON.stringify([{value1: value1, value2: value2, value3:value3}]));
        d3.select("#scnrrsltpieChart").selectAll("svg").remove();
        d3.select("#scnrrsltpieChartBase").selectAll("svg").remove();
        //alert("removed plot")
        scnrrsltpie(value1, value2, value3, formData);
        scnrrsltpieBase(value1, value2, value3, formData);
        d3.select("#incrmtblowChart").selectAll("svg").remove();
        groupedhorizontalbarchart(value1, value2, value3, formData);
        newscenariovaluechange(value1, value2, value3, formData);

        if (this.value == '3') {
            $("#countrydropdown option[value='3']").hide();
        } else {
            $("#countrydropdown option[value='3']").show();

        }
    });

    $('#roi-tab').click(function () {

        var formData = $("#scnrinptsfrm").serializeArray();
        // alert('roi form data::'+JSON.stringify(formData));
        newscenarioROIvaluechange(formData);
        d3.select("#roibaseChart").selectAll("svg").remove();
        roigroupedbarChart(formData);

        function roigroupedbarChart(formData) {
            var margin = {
                    top: 25,
                    right: 20,
                    bottom: 30,
                    left: 40
                },
                width = 960 - margin.left - margin.right,
                height = 270 - margin.top - margin.bottom;

            var svg = d3.select("#roibaseChart").append("svg")
                // .attr("width", width + margin.left + margin.right)
                // .attr("height", height + margin.top + margin.bottom)
                .attr("preserveAspectRatio", "xMinYMin meet")
                .attr("viewBox", "0 0 960 270")
                .classed("svg-content", true)
                .attr("id", "groupRoi")
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
            var data = {
                callname: "groupedroibarchart",
                formdata: formData,

            };
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                url: "sceneanalysis",
                data: JSON.stringify(data),
                success: function (data) {

                    // alert('ValData==>' + JSON.stringify(data));
                    var filtered = data.filter(function (d) {
                        return d.Base_Scenario > 0;
                    });
                    data = filtered;
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
                        return d3.max(c.itempercents, function (d) {
                            // alert('Data==>' + JSON.stringify(c.itempercents));
                            var filtered = c.itempercents.filter(function (d) {
                                return d.value > 0;
                            });

                            return d.value;
                        });
                    })]);

                    // var formatpercentValue = d3.format(".1%");
                    // alert('2Data==>' + JSON.stringify(data));
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
                        .attr("transform", "rotate(-20)")
                        .attr("x", function (d, i) {
                            return ((x1(d.name) + (x1.bandwidth() / 2) - 5) * Math.cos(-20 * Math.PI / 180) + (y(d.value) - 2) * Math.sin(-20 * Math.PI / 180));
                        })
                        .attr("y", function (d) {
                            return (-(x1(d.name) + (x1.bandwidth() / 2) - 5) * Math.sin(-20 * Math.PI / 180) + (y(d.value) - 2) * Math.cos(-20 * Math.PI / 180));
                        })
                        .text(function (d) {
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
                            return d;
                        });

                },
                dataType: "json"
            });

        }
    });




    function newscenariovaluechange(value1, value2, value3, formData) {
        //alert(JSON.stringify([{value1: value1, value2: value2, value3:value3}]));
        var bdata = {
            callname: "boxdata",
            formdata: formData,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]
        };

        //alert('piechartDat Along with value: '+JSON.stringify(bdata));

        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "sceneanalysis",
            data: JSON.stringify(bdata),
            success: function (bdata) {
                //alert(' data::'+JSON.stringify(bdata));

                var slctchngspnd = bdata.Change_in_count;
                var slctnewscnrspnd = bdata.New_scenario_Booking_Count;
                var slctbasescrnspnd = bdata.Base_Scenario_Booking_Count;

                var changeValuePositiveHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-up green" aria-hidden="true"></i>';
                var changeValueNegativeHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-down red" aria-hidden="true"></i>';

                var scltpercentage = ((slctnewscnrspnd - slctbasescrnspnd) / slctbasescrnspnd) * 100;
                //alert('scltpercent::'+scltpercentage);		


                $("#newscnrbookonslct").html(commaSeparatevalue(round(bdata.New_scenario_Booking_Count, 0)));
                $("#basescnrbookonslct").html(commaSeparatevalue(round(bdata.Base_Scenario_Booking_Count, 0)));
                $("#chnginspndonslctprcnt").html("(" + round(scltpercentage, 2) + "%)");

                //var slctchngspnd=$("#chnginspndonslct").html("$ "+round(bdata.Change_in_percentage,2));
                if (slctchngspnd == 0) {
                    $("#chnginspndonslct").html("0");
                } else {
                    $("#chnginspndonslct").html(slctchngspnd >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(slctchngspnd, 0))) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', commaSeparatevalue(round(slctchngspnd, 0))));
                }
                //alert(slctchngspnd);		

            },

            dataType: "json"
        });


    }

    function newscenarioROIvaluechange(formData) {
        // alert('inside newscenarioROIvaluechange');
        var rdata = {
            callname: "roiboxdata",
            formdata: formData
        };

        // alert('ROI Box data : '+JSON.stringify(rdata));

        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "sceneanalysis",
            data: JSON.stringify(rdata),
            success: function (rdata) {
                // alert(' data::'+JSON.stringify(rdata));

                //var roichngspnd = rdata.Change_in_ROI;
                var roinewscnrspnd = rdata.New_scenario_Overall_ROI;
                var roibasescrnspnd = rdata.Base_Scenario_Overall_ROI;
                var roichngspnd = rdata.Change_in_percentage;
                var roichngspnd = (round(roinewscnrspnd, 2) - round(roibasescrnspnd, 2));
                //alert('roichngspnd....'+ roichngspnd);
                // alert('roinewscnrspnd...'+ roinewscnrspnd);
                // alert('oibasescrnspnd....'+ roibasescrnspnd);

                var changeValuePositiveHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-up green" aria-hidden="true"></i>';
                var changeValueNegativeHtml = ' $CHANGED_VALUE$ <i class="fa fa-arrow-down red" aria-hidden="true"></i>';

                var roipercentage = ((round(roinewscnrspnd, 2) - round(roibasescrnspnd, 2)) / round(roibasescrnspnd, 2)) * 100;
                // alert('roipercentage::'+roipercentage);		


                $("#roinewscrnspnd").html("$ " + commaSeparatevalue(round(roinewscnrspnd, 2)));
                $("#newscrnbasespnd").html("$ " + commaSeparatevalue(round(roibasescrnspnd, 2)));
                $("#roichnginspndprcnt").html("(" + round(roipercentage, 2) + "%)");

                // var roichngspnd=$("#chnginspndonslct").html("$ "+round(roichngspnd,2));
                // alert('ROI chang in spend::'+roichngspnd);	

                if (roichngspnd == 0) {
                    $("#roichnginspnd").html("$ 0");
                } else {
                    $("#roichnginspnd").html(roichngspnd >= 0 ? changeValuePositiveHtml.replace('$CHANGED_VALUE$', "$ " + round(roichngspnd, 2)) : changeValueNegativeHtml.replace('$CHANGED_VALUE$', "$ " + round(roichngspnd, 2)));
                }

            },

            dataType: "json"
        });


    }
    //////////////////ROI bar charts starts////////////////////////////////////
    function scnrrsltpie(value1, value2, value3, formData) {
        //alert('piechart');
        //alert('piechart FormData: '+JSON.stringify(formData));

        var width = 360;
        var height = 360;
        var svg = d3.select("#scnrrsltpieChart").append("svg")
            // .attr("width", width)
            // .attr("height", height)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "-55 0 500 350")
            .attr("id", "pienew")
            .classed("svg-content", true);

        var radius = Math.min(width, height) / 2;
        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var color = d3.scaleOrdinal(["#C0504E", "#4F81BC"]);

        var pie = d3.pie()
            .sort(null)
            .value(function (d) {
                return d.Value;
            });

        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var label = d3.arc()
            .outerRadius(radius - 100)
            .innerRadius(radius - 100);

        //var f = JSON.stringify([{value1: value1, value2: value2, value3:value3}]);
        var data = {
            callname: "piedata",
            formdata: formData,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]

        };
        //alert('piechartDat Along with value: '+JSON.stringify(data));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "sceneanalysis",
            data: JSON.stringify(data),
            success: function (data) {
                //alert('piedata main data::'+JSON.stringify(data));
                var arc = g.selectAll(".arc")
                    .data(pie(data))
                    .enter().append("g")
                    .attr("class", "arc");
                arc.append("path")
                    .attr("d", path)
                    .attr("fill", function (d) {
                        return color(d.data.BookingCat);
                    });
                arc.append("text")
                    .attr("transform", function (d) {
                        return "translate(" + label.centroid(d) + ")";
                    })
                    // .attr("dx", "3em")
                    // .attr("dy", "0.85em")
                    .attr("text-anchor", "middle")
                    .attr("class", "piearctxt")
                    .style("fill", "#ffffff")
                    .text(function (d) {
                        return d.data.BookingCat;
                    });

            },

            dataType: "json"
        });

    }

    function optimscnrrsltpie(value1, value2, value3, formData) {
        //alert('piechart');
        //alert('piechart FormData: '+JSON.stringify(formData));

        var width = 360;
        var height = 360;
        var svg = d3.select("#optimscnrrsltpieChart").append("svg")
            // .attr("width", width)
            // .attr("height", height)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "-55 0 500 350")
            .attr("id", "pienew")
            .classed("svg-content", true);

        var radius = Math.min(width, height) / 2;
        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var color = d3.scaleOrdinal(["#C0504E", "#4F81BC"]);

        var pie = d3.pie()
            .sort(null)
            .value(function (d) {
                return d.Value;
            });

        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var label = d3.arc()
            .outerRadius(radius - 100)
            .innerRadius(radius - 100);

        //var f = JSON.stringify([{value1: value1, value2: value2, value3:value3}]);
        var data = {
            callname: "piedata",
            formdata: formData,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]

        };
        //alert('piechartDat Along with value: '+JSON.stringify(data));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "sceneanalysis",
            data: JSON.stringify(data),
            success: function (data) {
                //alert('piedata main data::'+JSON.stringify(data));
                var arc = g.selectAll(".arc")
                    .data(pie(data))
                    .enter().append("g")
                    .attr("class", "arc");
                arc.append("path")
                    .attr("d", path)
                    .attr("fill", function (d) {
                        return color(d.data.BookingCat);
                    });
                arc.append("text")
                    .attr("transform", function (d) {
                        return "translate(" + label.centroid(d) + ")";
                    })
                    // .attr("dx", "3em")
                    // .attr("dy", "0.85em")
                    .attr("text-anchor", "middle")
                    .attr("class", "piearctxt")
                    .style("fill", "#ffffff")
                    .text(function (d) {
                        return d.data.BookingCat;
                    });

            },

            dataType: "json"
        });

    }


    function scnrrsltpieBase(value1, value2, value3, formData) {
        //alert('piechart');
        //alert('piechart FormData: '+JSON.stringify(formData));

        var width = 360;
        var height = 360;
        var svg = d3.select("#scnrrsltpieChartBase")
            .append("svg")
            // .attr("width", width)
            // .attr("height", height)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "-55 0 500 350")
            .attr("id", "pieBase")
            .classed("svg-content", true);

        var radius = Math.min(width, height) / 2;
        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var color = d3.scaleOrdinal(["#C0504E", "#4F81BC"]);

        var pie = d3.pie()
            .sort(null)
            .value(function (d) {
                return d.Value;
            });

        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var label = d3.arc()
            .outerRadius(radius - 100)
            .innerRadius(radius - 100);

        //var f = JSON.stringify([{value1: value1, value2: value2, value3:value3}]);
        var data = {
            callname: "basepiedata",
            formdata: formData,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]

        };
        // alert('piechartDat Along with value: '+JSON.stringify(data));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "sceneanalysis",
            data: JSON.stringify(data),
            success: function (data) {
                // alert('piedata main data::'+JSON.stringify(data));
                var arc = g.selectAll(".arc")
                    .data(pie(data))
                    .enter().append("g")
                    .attr("class", "arc");

                arc.append("path")
                    .attr("d", path)
                    .attr("fill", function (d) {
                        return color(d.data.BookingCat);
                    });

                arc.append("text")
                    .attr("transform", function (d) {
                        return "translate(" + label.centroid(d) + ")";
                    })
                    // .attr("dx", "3em")
                    // .attr("dy", "0.85em")
                    .attr("text-anchor", "middle")
                    .attr("class", "piearctxt")
                    .style("fill", "#ffffff")
                    //.style("font", "bold 0.89vw Arial")
                    .text(function (d) {
                        return d.data.BookingCat;
                    });

            },

            dataType: "json"
        });

    }

    function optimscnrrsltpieBase(value1, value2, value3, formData) {
        //alert('piechart');
        //alert('piechart FormData: '+JSON.stringify(formData));

        var width = 360;
        var height = 360;
        var svg = d3.select("#optimscnrrsltpieChartBase")
            .append("svg")
            // .attr("width", width)
            // .attr("height", height)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "-55 0 500 350")
            .attr("id", "pieBase")
            .classed("svg-content", true);

        var radius = Math.min(width, height) / 2;
        var g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var color = d3.scaleOrdinal(["#C0504E", "#4F81BC"]);

        var pie = d3.pie()
            .sort(null)
            .value(function (d) {
                return d.Value;
            });

        var path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        var label = d3.arc()
            .outerRadius(radius - 100)
            .innerRadius(radius - 100);

        //var f = JSON.stringify([{value1: value1, value2: value2, value3:value3}]);
        var data = {
            callname: "basepiedata",
            formdata: formData,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]

        };
        // alert('piechartDat Along with value: '+JSON.stringify(data));
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "sceneanalysis",
            data: JSON.stringify(data),
            success: function (data) {
                // alert('piedata main data::'+JSON.stringify(data));
                var arc = g.selectAll(".arc")
                    .data(pie(data))
                    .enter().append("g")
                    .attr("class", "arc");

                arc.append("path")
                    .attr("d", path)
                    .attr("fill", function (d) {
                        return color(d.data.BookingCat);
                    });

                arc.append("text")
                    .attr("transform", function (d) {
                        return "translate(" + label.centroid(d) + ")";
                    })
                    // .attr("dx", "3em")
                    // .attr("dy", "0.85em")
                    .attr("text-anchor", "middle")
                    .attr("class", "piearctxt")
                    .style("fill", "#ffffff")
                    //.style("font", "bold 0.89vw Arial")
                    .text(function (d) {
                        return d.data.BookingCat;
                    });

            },

            dataType: "json"
        });

    }

    function groupedhorizontalbarchart(value1, value2, value3, formData) {

        var margin = {
                top: 20,
                right: 20,
                bottom: 30,
                left: 155
            },
            width = 960 - margin.left - margin.right,
            height = 700 - margin.top - margin.bottom;

        var svg = d3.select("#incrmtblowChart").append("svg")
            // .attr("width", width + margin.left + margin.right)
            // .attr("height", height + margin.top + margin.bottom)
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox", "0 0 1025 705")
            .attr("id", "horizGroup")
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


        var z = d3.scaleOrdinal()
            .range(["#F77C05", "#B4BAB8"]);

        //var divTooltip = d3.select("body").append("div").attr("class", "toolTip");

        var data = {
            callname: "groupedbarchart",
            formdata: formData,
            filtervalues: [{
                value1: value1,
                value2: value2,
                value3: value3
            }]
        };

        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            url: "sceneanalysis",
            data: JSON.stringify(data),
            success: function (data) {

                // alert(JSON.stringify(data));
                $(data).each(function (i, d) {
                    var temp = JSON.parse(JSON.stringify(d, ["Label", "New_Scenario", "Base_Scenario"]));
                    data[i] = temp;
                });
                // alert("after : " + JSON.stringify(data));
                var filtered = data.filter(function (d) {
                    return d.Base_Scenario > 0;
                });
                data = filtered;
                data = data.reverse();

                var n = data.length / 2;
                var itemWidth = 120;
                var itemHeight = 18;

                var scnrpercents = d3.keys(data[0]).filter(function (key) {
                    return key !== "Label";
                });

                data.forEach(function (d) {
                    d.itempercents = scnrpercents.map(function (name) {
                        return {
                            name: name,
                            value: +d[name]
                        };
                    });
                });

                y0.domain(data.map(function (d) {
                    return d.Label;
                }));
                y1.domain(scnrpercents).rangeRound([0, y0.bandwidth()]);
                x.domain([0, d3.max(data, function (d) {
                    return d3.max(d.itempercents, function (d) {
                        return d.value;
                    });
                })]);


                var formatpercentValue = d3.format(".1%");

                svg.append("g")
                    .attr("class", "grpbaryaxistxt")
                    .call(d3.axisLeft(y0));

                svg.selectAll(".y.axis .adi")
                    .call(verticalWrap, y0.bandwidth());
                // .call(Horizontalwrap, y0.bandwidth());


                var bar = svg.selectAll(".bar")
                    .data(data)
                    .enter().append("g")
                    .attr("class", "rect")
                    .attr("transform", function (d) {
                        return "translate( 0," + y0(d.Label) + ")";
                    });

                var bar_enter = bar.selectAll("rect")
                    .data(function (d) {
                        return d.itempercents;
                    })
                    .enter();


                bar_enter.append("rect")
                    .attr("height", y1.bandwidth())
                    .attr("y", function (d) {
                        return y1(d.name);
                    })
                    .attr("x", function (d) {
                        return 0;
                    })
                    .attr("value", function (d) {
                        return d.name;
                    })
                    .attr("width", function (d) {
                        return x(d.value);
                    })
                    .style("fill", function (d) {
                        return z(d.name);
                    });

                bar_enter.append("text")
                    .attr("class", "barstext")
                    .attr("x", function (d) {
                        return x(d.value) + 5;
                    })
                    .attr("y", function (d) {
                        return y1(d.name) + (y1.bandwidth() / 2);
                    })

                    .attr("dy", ".35em")
                    // .text(function(d) { return d.value; });
                    .text(function (d) {
                        return formatpercentValue(d.value / 100);
                    });

                var legendGroup = svg.append("g")
                    .attr("transform", "translate(" + (width - 150) + ",-10)");

                var legend = legendGroup.selectAll(".legend")
                    .data(splitjoin(scnrpercents.slice()))
                    .enter()
                    .append("g")
                    .attr("class", "legend")
                    .attr("transform", function (d, i) {
                        return "translate(" + i % n * itemWidth + "," + Math.floor(i / n) * itemHeight + ")";
                    });


                var rects = legend.append('rect')
                    .attr("width", 18)
                    .attr("height", 18)
                    .attr("fill", function (d, i) {
                        // alert(i + " - " + JSON.stringify(d));
                        return z(i);
                        // return z1(i);
                    });

                var text = legend.append('text')
                    .attr("x", 15)
                    .attr("y", 12)
                    .attr("dx", ".45em")
                    .attr("dy", ".15em")
                    .style("text-anchor", "start")
                    .text(function (d) {
                        return d;
                    });
            },
            dataType: "json"
        });
    }

    // function optimgroupedhorizontalbarchart(value1, value2, value3, formData) {

    //     var margin = {
    //             top: 20,
    //             right: 20,
    //             bottom: 30,
    //             left: 125
    //         },
    //         width = 960 - margin.left - margin.right,
    //         height = 700 - margin.top - margin.bottom;

    //     var svg = d3.select("#optimincrmtblowChart").append("svg")
    //         // .attr("width", width + margin.left + margin.right)
    //         // .attr("height", height + margin.top + margin.bottom)
    //         .attr("preserveAspectRatio", "xMinYMin meet")
    //         .attr("viewBox", "0 0 1025 705")
    //         .attr("id", "horizGroup")
    //         .classed("svg-content", true)
    //         .append("g")
    //         .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    //     var y0 = d3.scaleBand()
    //         .rangeRound([height, 0])
    //         .paddingOuter(0.2)
    //         .paddingInner(0.2);

    //     var y1 = d3.scaleBand()
    //         .padding(0.05);

    //     var x = d3.scaleLinear()
    //         .rangeRound([0, width]);


    //     var z = d3.scaleOrdinal()
    //         .range(["#F77C05", "#B4BAB8"]);

    //     //var divTooltip = d3.select("body").append("div").attr("class", "toolTip");

    //     var data = {
    //         callname: "groupedbarchart",
    //         formdata: formData,
    //         filtervalues: [{
    //             value1: value1,
    //             value2: value2,
    //             value3: value3
    //         }]
    //     };

    //     $.ajax({
    //         type: "POST",
    //         contentType: "application/json; charset=utf-8",
    //         url: "/sceneanalysis",
    //         data: JSON.stringify(data),
    //         success: function (data) {

    //             // alert(JSON.stringify(data));
    //             $(data).each(function (i, d) {
    //                 var temp = JSON.parse(JSON.stringify(d, ["Label", "New_Scenario", "Base_Scenario"]));
    //                 data[i] = temp;
    //             });
    //             // alert("after : " + JSON.stringify(data));
    //             var filtered = data.filter(function (d) {
    //                 return d.Base_Scenario > 0;
    //             });
    //             data = filtered;
    //             data = data.reverse();

    //             var n = data.length / 2;
    //             var itemWidth = 120;
    //             var itemHeight = 18;

    //             var scnrpercents = d3.keys(data[0]).filter(function (key) {
    //                 return key !== "Label";
    //             });

    //             data.forEach(function (d) {
    //                 d.itempercents = scnrpercents.map(function (name) {
    //                     return {
    //                         name: name,
    //                         value: +d[name]
    //                     };
    //                 });
    //             });

    //             y0.domain(data.map(function (d) {
    //                 return d.Label;
    //             }));
    //             y1.domain(scnrpercents).rangeRound([0, y0.bandwidth()]);
    //             x.domain([0, d3.max(data, function (d) {
    //                 return d3.max(d.itempercents, function (d) {
    //                     return d.value;
    //                 });
    //             })]);


    //             var formatpercentValue = d3.format(".1%");

    //             svg.append("g")
    //                 .attr("class", "grpbaryaxistxt")
    //                 .call(d3.axisLeft(y0));

    //             svg.selectAll(".y.axis .tick text")
    //                 .call(verticalWrap, y0.bandwidth());
    //             // .call(Horizontalwrap, y0.bandwidth());


    //             var bar = svg.selectAll(".bar")
    //                 .data(data)
    //                 .enter().append("g")
    //                 .attr("class", "rect")
    //                 .attr("transform", function (d) {
    //                     return "translate( 0," + y0(d.Label) + ")";
    //                 });

    //             var bar_enter = bar.selectAll("rect")
    //                 .data(function (d) {
    //                     return d.itempercents;
    //                 })
    //                 .enter()


    //             bar_enter.append("rect")
    //                 .attr("height", y1.bandwidth())
    //                 .attr("y", function (d) {
    //                     return y1(d.name);
    //                 })
    //                 .attr("x", function (d) {
    //                     return 0;
    //                 })
    //                 .attr("value", function (d) {
    //                     return d.name;
    //                 })
    //                 .attr("width", function (d) {
    //                     return x(d.value);
    //                 })
    //                 .style("fill", function (d) {
    //                     return z(d.name);
    //                 });

    //             bar_enter.append("text")
    //                 .attr("class", "barstext")
    //                 .attr("x", function (d) {
    //                     return x(d.value) + 5;
    //                 })
    //                 .attr("y", function (d) {
    //                     return y1(d.name) + (y1.bandwidth() / 2);
    //                 })

    //                 .attr("dy", ".35em")
    //                 // .text(function(d) { return d.value; });
    //                 .text(function (d) {
    //                     return formatpercentValue(d.value / 100);
    //                 });

    //             var legendGroup = svg.append("g")
    //                 .attr("transform", "translate(" + (width - 150) + ",-10)");

    //             var legend = legendGroup.selectAll(".legend")
    //                 .data(splitjoin(scnrpercents.slice()))
    //                 .enter()
    //                 .append("g")
    //                 .attr("class", "legend")
    //                 .attr("transform", function (d, i) {
    //                     return "translate(" + i % n * itemWidth + "," + Math.floor(i / n) * itemHeight + ")";
    //                 });


    //             var rects = legend.append('rect')
    //                 .attr("width", 18)
    //                 .attr("height", 18)
    //                 .attr("fill", function (d, i) {
    //                     // alert(i + " - " + JSON.stringify(d));
    //                     return z(i);
    //                     // return z1(i);
    //                 });

    //             var text = legend.append('text')
    //                 .attr("x", 15)
    //                 .attr("y", 12)
    //                 .attr("dx", ".45em")
    //                 .attr("dy", ".15em")
    //                 .style("text-anchor", "start")
    //                 .text(function (d) {
    //                     return d;
    //                 });
    //         },
    //         dataType: "json"
    //     });
    // }



});


function updateBar(id, sliderValue) {

    //  alert('id In UpdateBarfnct:: ' + id);
    //  alert('sliderValue In UpdateBarfnct:: ' + sliderValue);

    var baseValue = removeCommaAndK_Mvalues($('#' + id + ' li:nth-child(2)').children('.percent').html().replace("$", ""));

    // alert('Base val In UpdateBarfnct:: ' + baseValue);

    // var value = Math.round(parseInt(baseValue) * (1 + parseFloat(sliderValue / 100)));
    var value = ((parseInt(sliderValue) * parseInt(baseValue)) / 100) + parseInt(baseValue);
    // alert('Optimized val In UpdateBarfnct:: '+ value);

    $('#' + id + ' li:nth-child(1)').children('.percent').html('$' + commaSeparateNumber(round(value, 0)));

    // alert(sliderValue +" % "+baseValue+" = "+((parseInt(sliderValue) * parseInt(baseValue))/ 100));

    var ww = $('#' + id + ' li:nth-child(2)').width() - margin_bar;
    var pc = value / maxValue * 100;
    var len = parseFloat(ww) * parseFloat(pc) / 100;
    //  alert(ww+" - "+len);
    $('#' + id + ' li:nth-child(1)').children('.bar').animate({
        'width': len + 'px'
    }, 250);


}


function optimupdateBar(id, sliderValue) {

    // alert('optimupdateBarcalls');
    // alert('id In UpdateBarfnct:: ' + id);
    // alert('sliderValue In UpdateBarfnct:: ' + sliderValue);

    var baseValue = removeCommaAndK_Mvalues($('#' + id + ' li:nth-child(2)').children('.percent').html().replace("$", ""));

    // alert('Base val In UpdateBarfnct:: ' + baseValue);

    // var value = Math.round(parseInt(baseValue) * (1 + parseFloat(sliderValue / 100)));
    var value = ((parseInt(sliderValue) * parseInt(baseValue)) / 100) + parseInt(baseValue);
    // alert('Optimized val In UpdateBarfnct:: ' + value);

    $('#' + id + ' li:nth-child(1)').children('.percent').html('$' + commaSeparateNumber(round(value, 0)));

    // alert(sliderValue +" % "+baseValue+" = "+((parseInt(sliderValue) * parseInt(baseValue))/ 100));

    var ww = $('#' + id + ' li:nth-child(2)').width() - margin_bar;
    var pc = value / maxValue * 100;
    var len = parseFloat(ww) * parseFloat(pc) / 100;
    //  alert(ww+" - "+len);
    $('#' + id + ' li:nth-child(1)').children('.bar').animate({
        'width': len + 'px'
    }, 250);

    //To fix optimizTION with issue #########################

    $("#" + id).val(sliderValue);

    var ww1 = $('#' + id + ' li:nth-child(2)').width() - margin_bar;
    var pc1 = baseValue / maxValue * 100;
    var len1 = parseFloat(ww1) * parseFloat(pc1) / 100;
    $('#' + id + ' li:nth-child(2)').children('.bar').animate({
        'width': len1 + 'px'
    }, 250);

    //############################
}




function pdfFromHTML(btnid) {
    $("#pageloaddiv").show();
    // alert("BtnID::" + btnid);
    var btnno = btnid.split("_")[1];
    if (btnno == "s") {
        var hdrtxt = "Scenario Analysis Report";
    } else {
        var hdrtxt = "Scenario Comparison Report";
    }
    alert("BtnNo::" + btnno);
    var classtosearch = "pdfrsltbox" + "_" + btnno;
    alert("ClassTo::" + classtosearch);
    var cid = $("." + classtosearch).attr("id");
    alert(cid);

    function getStyle(el, styleProp) {
        var camelize = function (str) {
            return str.replace(/\-(\w)/g, function (str, letter) {
                return letter.toUpperCase();
            });
        };

        if (el.currentStyle) {
            return el.currentStyle[camelize(styleProp)];
        } else if (document.defaultView && document.defaultView.getComputedStyle) {
            return document.defaultView.getComputedStyle(el, null)
                .getPropertyValue(styleProp);
        } else {
            return el.style[camelize(styleProp)];
        }
    }

    var svgElements = $('#' + cid).find('svg');
    // console.log('Elements::' + svgElements);
    //replace all svgs with a temp canvas
    $.each(svgElements, function (k, v) {
        // alert(JSON.stringify(k) + ":" + JSON.stringify(v));
        var svgID = v.id;
        // console.log('ID Value::' + svgID);
        var canvas, xml;

        // canvg doesn't cope very well with em font sizes so find the calculated size in pixels and replace it in the element.
        $.each($(this).find('[style*=rem]'), function (index, el) {
            $(this).css('font-size', getStyle(el, 'font-size'));
        });
        // console.log('Width::' + document.getElementById(svgID).viewBox.baseVal.width);
        // console.log('Height::' + document.getElementById(svgID).viewBox.baseVal.height);


        canvas = document.createElement("canvas");
        canvas.className = "screenShotTempCanvas";

        var viewBoxAttr = document.getElementById(svgID).viewBox.baseVal;
        // alert(svgID);
        if (svgID.includes("pie")) {
            canvas.width = viewBoxAttr.width - 150;
            canvas.height = viewBoxAttr.height - 70;
        } else if (svgID.includes("Roi")) {
            canvas.width = viewBoxAttr.width + 250;
            // canvas.width = 1123;
            canvas.height = viewBoxAttr.height;
        } else {
            canvas.width = viewBoxAttr.width - 280;
            canvas.height = viewBoxAttr.height;
        }

        //   canvas.width = window.innerWidth;
        //convert SVG into a XML string
        xml = (new XMLSerializer()).serializeToString(this);

        // Removing the name space as IE throws an error
        xml = xml.replace(/xmlns=\"http:\/\/www\.w3\.org\/2000\/svg\"/, '');

        //draw the SVG onto a canvas
        canvg(canvas, xml);
        $(canvas).insertAfter(this);
        //hide the SVG element
        $(this).attr('class', 'tempHide');
        $(this).hide();

    });


    $(".exprtbtn").css("display", "none");
    $(".exprtitems").css("display", "none");
    $("#scnripBox").css("display", "block");
    $("#optimscnripBox").css("display", "block");
    $("#scnrcompinputBox").css("display", "block");
    $("#compscnrbtnboxThree").css("display", "none");



    html2canvas(document.querySelector("#" + cid), {
        allowTaint: true,
        logging: true,
        useCORS: true
    }).then(canvas => {
        document.body.appendChild(canvas);
        var quality = [0.0, 1.0];
        var img = canvas.toDataURL("image/png", quality);
        doc = new jsPDF("p", "mm", [canvas.width, canvas.height], true);

        var logoimage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAcwAAAD6CAYAAAAsj3eCAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA2ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpFMzhBNEM0RTY1MjhFNjExQUFDMUNEOTJFRUZCRTBFNiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo0RTgwMzM2NDI4NzMxMUU2ODY0OUZFNjAzQjcyNDQ4MiIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo0RTgwMzM2MzI4NzMxMUU2ODY0OUZFNjAzQjcyNDQ4MiIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ1M2IChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkUzOEE0QzRFNjUyOEU2MTFBQUMxQ0Q5MkVFRkJFMEU2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkUzOEE0QzRFNjUyOEU2MTFBQUMxQ0Q5MkVFRkJFMEU2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+nf4dBAAAGC1JREFUeNrs3cFx20iiBmDY5fswg+FEMHK9AExHYDkCSZd3lRWBrAhkX/ciKgLJEZgO4JU5EQw3A24EfmxtYxeGGyQAAgQkfV+Vandsi0QDjf67gUbjxY8fPzIAYLuXdgEACEwAEJgAIDABQGACgMAEAIEJAAITABCYACAwAUBgAoDABACBCQACEwAEJgAgMAFAYAKAwAQAgQkAAhMABCYACEwAEJgAgMAEAIEJAAITAAQmAAhMABCYACAwAQCBCQACEwAEJgAITAAQmAAgMAFAYAIAAhMABCYACEwAEJgAIDABQGACgMAEAIEJAAhMABCYACAwAUBgAoDABACBCQACEwAQmAAgMAFAYAKAwAQAgQkAAhMABCYAIDABQGACgMAEAIEJAAITAAQmAAhMABCYAIDABACBCQACEwAEJgAITAAQmAAgMAEAgQkAAhMABCYACEwAEJgAIDABQGACgMAEAAQmAAhMABCYACAwAUBgAoDABACBCQAITAAQmAAgMAFAYAKAwAQAgQkAAhMAEJgAIDABQGACgMAEAIEJAAITAJ6oV3YB1PPif/73aPM/Xzc/kw4/dv7j//5x9sTK9GlTpovNZ3/c/P/zzc+q8Plnm79bqE08yjbgx48f9gIMGzBXmxD5+JQ6AJvPvt78/1ko2+ZnHX+mm5+bzc/bzb9Zqk0ITHj6oXm8+Z+7jj82jLzmByxDCMm/Ow7L+00Z3m8+exo/+48YkKsYnp/jv3u3+Xdv1SQeG/cwoaFNY38fAq7jj73ZBM3pAcOy65HlsrBPQjguNvtpFf/7S/z78H3z+PcgMOGZhGZo+C96CM2jA4Vll98TwjBcZl3H/w4jzHXh7y83P8cxRNdqDwITnl9ofoojpi597Tk07zoOy3UpLINF6TtCxyLsq9mmbGF0uVJ7EJjw/ELzrOPQnPQVmpvPDPcTZz2HZRZnwa7j9y3jv/u2+fl98xMmA92qOTxGJv1AN2H0teMwCqOw111dwozhddpDWC4rvi+/9JuH5W/Zvy/LholBF2oMzy4wYy84nBirwg1+eI6BeYh7g2237UMc2XWp1qzeOKP4KAbnvXaCZxGYMRxPYuWfbel1LmOPcj7WkyNOe58W/2zIh6ljY1tuaJdjnyCR2u7n/FD6GEMzzry9GSIse97XR3HE+iZ22o8S+y0f3d4/h+c+x9auPUWvap5wl+UDUWESwzT8XG5+NxysqxEetLxMPxV1wO3JHyAvCs+pjb2yp7b7xXM9mUKober8WdbtIxtHcXTY+DGWnsLyasiwbNAe5QGat0Wrobf9GbZrj7nzcVyoQ4s8w17t6K3sO0ngITw3n3Ufe6WmlKuI5V7w+in1/kNZNmV823Fonm4+M2uyhF4cgXUdlvMhViSK5ZnF8kxbfsRDe7b5nPPYFllpiFQ9K957/xL/ONSbcMXv/cstlfN71t0khpDWX+PG8LydxgqZ/1w/tQLGxvh91/stLjdXNyy/9hCWg6x5G9ek/bpHWJZHnt8PtUgEj0547Cq/rfhu8/Nn9u+rO5Nw/r2sGIpW9Y5D6s5jY/DH5gR6kf9s/vt1/ODFlooqNHkW4iWcrgPmw66Gvqf1YZcDhmUYVV5W/HXeHoVte1v6CTNx77d89I3QJHHuHMW6/iaOMEMdO4917PRV4heqLuOEB4+vqi6rxl51+JkXPucoEZp3sULDUw/NcC5kWbeXRm/i5dl54oSfxO/qesm7Qc7XOLv3tCIow7q0n7bc5gkdlk/xFsBlxefkl9pcniWL502xLvwZM+s2TGAN59erGidbqJDvm0zciRXwdcWzX+Ge5ukTv/n+nEZRJhXsDs03WbfPQIaGflU8J3uaobvKOnispWVYzrL05fplbI9WNfd/+Hfh7SlfKtq38Gevn0h1m2fjnyj4GEIz91f5fCqOMD8kTratDyfXqKxn8UQ+Lv3VZdb9kmIw1tA8iyPNLkPzLkwuKpybXYdl3lEeaqLeTdVot802hQXz4zEov2Xm6Kl04GPnYOWM2+tqyrSwylZ+br3Z/NnDI5MvC73T88QHXHVwueIs+3kh5qy0UfAsQrPj3v9/ltCLV3L6WB92kEuV8d7itOsAj2+ZSQXjOzWUWLeuYuczf8POPI40w9WOi1eF0WX5UsUiLi6990ZsToB5/I6ik+zn68V1TqRp4kQa9AH/eOmoqLdVjyoWOOj9sYxiGT0IvZf3HY8EQ3343sN2Dv3YxWVF572L8+oqMdI/DufWPu1I4dx89KueFdvZvs/3QtvSSzvetCwh8+Izu9dxEDmJo/aH25KvCuGVqlhduU0E5lGDAocNP84qppWHG/fxO+aHCM/YAz6vKkMcvt93cZLHE/E0++8qS9u+77ZuBY9lKB732+JlqXgF4DzRuLwo/ZvrUoV7W/qe69J2l4/hUVyHNav6nMRnBBdtGvXEZ4UOx/tDNESx8/g26/7yaddheT9gY506z1dddN7jMVjF58KPE+3RorQtH0u/+zHR2IdzZFYYcIR28+OW0fKiaQiVtyOrWEUtbs9s2zZXfH6+itusXC/jZewsDm4WsZ1Y7nF8Z/G7jsuDtPhdi9iW37dpy7soS6z/yXPgVfyCVAVddNhQhIe5ywG8qllRLmt8xVH8CSt69HbCN3h4Og+58Ozcp7aLTcdjc9fw++ouEjEtnVzfWuz3Sbb7Wd2jHf+mzmf81dEViknic+aHvuzTw2pAXYblfOBtSF0e/dzxd3yOdarpSPdjoR7dJEI35SRRv5u2rZeJ30+1n7Oqbd5yPtxl9Z63z9vYD3EFt7Mmg4FC53rXd+Whf92kLW+40E7rsryqOOi3PTQUHxvs3LYz/h4qQNzRnZ74eyxg/SEGbdPJCkex8jdtVI/jqO19yxFY12+16MJ99uskkFDOixb7pu/GuG4HsuvVgPY1H8nEl1nF8e9y/y+ylveTe5qNPMRIfp/ndcMx+l6adLbralbTR6vytnzngOOQZQmTfv5M/PliwAO5rUKu4rZdxZOoqlfQ6UPJO8IybM+n+LPYEn5NK0wqLIvln28ZYU1jZZs0LOfpCMMyvxlfbsynifvHu5wnrqQsByrTYM83VoTl2dAbsWWOwmpE1bHrF3AP1cbebQmY/JLlYksbO6nTpu0Iy1Xhe9ZbBhwfxlCWfIR5VNEDG8plYptCQa8qHtbOL0OUG88wpF90cA9xVhGWIbR+eXC6cNmvfGkkTCz40OBezKR00C9SxyU2MteJ0VN+iaLu/bnfKsoZvvNbPAZt9uVFqSwnpVBe1hwp3ibC/KRu5y7up6OhR5eJkeZZ1v2ar00sxhCWhTqbavDGEjSnFSPgRdzOf2WP4znI0yw9C/lhdaREmzaNnc1f5qFseySncAvrlw5alpjfUaMtXw5VlmJgpr5sqAo5SxRk67NX+eWVxKXESdz5+zYGN4n9Uzl8j9v5MV4bL/d8wj3WphOTwue831L+UOneV/TkQkjPanaATkvbGoL9874djvJ+SowK1zVnry3i7LVifT1ucHyPK07coUfPfawGVFcfa97uIzVy++eItu+61A7sWm1orFL3ibe1aeG8u9jU078S9fTdlvMo1XZW3pcstOUfEwOO64orMocqy4OXI+vRXVaE07pGwxMazvKBOI09in16lOXfrzXlPh78i8So8bTBJqyyms+exZ7Rpxr7tM6INpTxYoTT48sjwkmcVVlHeSb4/Vgaui3Hru+wfDuyxn5ScQ6MbfvydunjI30D01HiKsOyZj0td25nFW3nh0TbeVFnEk+c71I+H2YVt2B6L8uuwBxqdDlNbPBFwwp5UXNk0TbAF01m4FYclJMG39/olWjx5vgqUdGadBrG/M7AeY0grKpb5RPrdkwFi8fuUPt96FV8mhhbp23QRR166pg0aR++1OjkBOeJtnPe8HxY1TjXD1GW8QVmYuS1zhrOjosjonmNIXvdAJ920MiWR0VHNQOs7aM9n/foNKyGet9hzeObmvxzXGNy03GinPcjLN9Z1vGM0C0N/iqj1VWOJ7BYe7ldmSae9ayqo5+Kb6mKb6oqt52pRxXbzBf4XKMd67UsYw7MN6X/brvyw7emw+wKqd+776By1t2mtg1n6vf+3ON3x+a2RYfg5BGVM4Rmnw3yW2/n6Pwqx2OTOv5hfsXXBrc4GrWdLTuo5bZzkrgs23dZfvIq8WfTgQ7iUaKn0ma083vic2YtRmup/fChsFrEPurs428tRymrxOSYusf0y9jP9IrJPydVDdkYZ8fuGkXHZzT/zrp/RvPiEYblLBvPzNPlExmZ58sDThL7ehZXDgv7PEyMWbRoO8sd9HXLtrwqJxalc7nPsow2MJMFHtGI96Hn0tFn1xnx7XN/qRwotZ4be0TrxIaTpDhj8eE+bUVjdlrutT6CRu8662dBg5MWs7QPaez3VB/L+VG3U1b1sH/+hqnjOFrLR3Kh/F9qtBPTxOd11XZOEgOEMNP7rqey/BKYi3IwhWvQXfdEu1wPtINeydDqNIbLA3/fY5rtN89+fWY0nBCpmably7G3Yy7Ylpcmd3UefI2rmozxeC9rdlz33cepJRJXNSal/Ct7IgqrTdVZri6vO/lycqt4Hg3xSM3vqY7+vmWpO3fjZVa9JmEfJ+us9HOonv4k45AB3XsPOfv1EuxJomEsTz5oPJHswGF5mrVbfrHpeXg30l2wqtjePvbBZenn5CmdI3VDM77k4HU8n+q2x9O4z74P8JrGaR9l2ZSjVlnCCDO1CPG7rPvnwsohvN7RO5l3OBpYdfQ7XS1ltq55Ui8O+H2PTXnln6PElZHRPntZEZaHWrwgXMK+GdEKP3mjl7r//vCsbcezmlON7rdneh7li4ucxXo4jW31m8JIbNt+DFcs/thxXq0O1ZaXypJvf52yHNUpy6vY475OnFDTru71VMxWWiR2xLQUqIsB69E/U0P/A37/PqPio6fcMy5chinXmfIbTMr1bpSTfVKvSTuAsKhHNrbQjO3CaaID32Vgvnkso8d9Fl5p22mJg5V5/P78bULvsvStgkmsu2dbQm09xONqMTyXe5blJy/jDkpOze1w29/V6NEtD3ApponlwJX3zR4n2OQ59IyzLc9pJS7HrsY4Q3TPNy10EZofRrZLvlRs56Sj/T3J6j3PNxbTIb88jLbC6D52rP6o2E/HOwYbo1isvmVZfhlh5g3PTaKS7v2QbmzAU2l+nwjQ49Iot/Fb0Nu+RLVmj3OWtXgOq+4LYBMHrs17NI9rdE6einlpZDYtPEJ0MvbR5cBhmQsLW6/HsrpTaNASVw6yXT3/Bj4k9vf9iGcOH3Vc56blfVv3yllss95uPuPv7NfL5sUrkovygKvNRNKq99fm37NvWeLs2u87yvLzCDP+8jxLXxu+6aBnl7ovc5/YoPuKyt3USfbzzfx3LU/c1Mj7pEUFPc5+nWBQq2fZ8hVl5zU6J0/Cjsk/x4lwHVNY5q8UGsOEtE5fh9eB24pR5vGe+3xacX4ccub0mw7O530cx05a8aeL4zMthda6g3Lsajv3KktsP26bjOqLK/1cVfRuvrYNzfgGkVnir64qAqrcOzhvchk09thPa1ziaVsxZi0uYaXewbiq+buXTfZ9xYLHY3/ucN/AKB+j48Tl2FGNIEb6EuLrAWY8Vvm0pQN/tMc+Tz2rt+x5mcRV2xFjxcsf9rWs+J4mfqtRztSLMGYtBj/lY7U6QFmWOwOzYqHwYmg2OdCTxOu2/nMybBmaXyUa07s6oVnosWcdjizmiZ7Sdd2DUtFhaHJpcFq3w7LlkYSrkQ8U92qkY292VaozNwOOIOoYW1jm++3rGEIzdm7Otmxjo05rbD+q9vlFz8Up38+b1Nn+HieCLffpmFfcA14nOuWpdueubv2Kt7F2tZ19lWVdZ4QZvK/YiFDI8JzKzbbLIqFixsrwd0VYLrc14Pn70Cq++2PVjohh8T1xQnzaZ3S15cQN+6Hy4Ic/D3+f2AerBi+QLpb/76qQjvv8uqKzsHgMq/fEfTkr/jT8iM9bQng9poXWYyfqaKSHIg+k6dAbEuvtVcU2XtdZKzR23D9WtA0PjfoBzo/7itH8hx3b3Mu97YrbGNPYxp7u2J+zuF3TXWWM7e6nivq1rS2fxLbzMtF2zhuU5birshS9Km9AYcmkVAU7jUPrLBFskx0NQd337yVvxMYdGHoPy9Ko76iiYi27GF3FSQjzRPg9LLcUJyisSgdsuqVsda0L5ZrEkL4p7fdt+3ydjevlwNt6hceJnt6LBp8539Ibn4+l4FuuuuzjU5ZeS3Of0Lwbw2pAYbLeZjt+r9hnocHL1woNdao4se23+Pfb2qP5IR51iCvqLBKjpRCa57GBzlcQ+jP+u+KxXMVzuctO1lU83yaldusmdr7D9hafz/89q36Ocb2lnb1KHIe8LT+PbXnxuL3JqhfNOWtYlrvSOrJ1y3JROzBLoXmXbV/xp8koIGx03RchrwtrA04rRlx1GuXOTvgwDTl2ElIn7raA/OmAN5wldhYr1lGL/b7Kxvu+w0WpM9BJr7miU5MafQ4Vltc9hGVo9MPb4287HpGMZgm9eO79taVDlD9b16Q9+hTft3goF3EQkGo7PuzoNL/POr40G2eIXlRclZpUdGArt6/qKt6OAViT43ZWdSWg47LsrO8vqwoalxk6y/Zbvu4hscNnNXwRcgiW1y1HB/OshzfJx2d3LrLmzzQ+lKXFtP2HA5g1n+F6H79vlA9ix+PSZj/ukrpPOYq3S8RLXV0/7zjPFx2Ix7rrABjNEnrxNsbrbP9nJVexbbg48Pbnq8+sW2zrsqdtmsd92vb8yAclixrn+9us3cpx+T6Y1yjL2w7KsnNfv6qxIfN4wr/L6r+IeBEbsNazE/P7h5vvDkPu8/jd0y07NnznVc0GctXm5AsnbmEk825H7ygE15eaQblObE9+8/l9vN5+krj0UPz98H23De7JlPdBmxNz3XI/zuNlqrw8bzpoABaJV68NPrrsacm7ZXmFnrhPs46/azRL6MXG7G08F84btEX/aY9adFoXifreOqBinb/ccaVhlf26sPmy5nY0atfiPv0j1tHzrN7Vuybt2k+d5Hgl5HxLO1Zsi25jp3Bd9/xvWJZ1oV7UHpS8+PHjR9MGYJalL0OGg7Xq+yZ66gWiQ142ihN/frrn0OeoJvGw7uqJvKOv62AKdeKPgevGLGv3nFud3vC64js/Zt2u0vXTaHZkx3xW6LT+WTgPvxUCbznGWxNx24tzEJbZCFajKrSvs8J5tIwd+GWH35O3m7NifnTZnvVRlsaBCSMNzLvSqGPQRr6nVXxCQ/J6VwD0NLnoaoj1QGFMXtoFPIGwnGa/XqK7HXB7+gjLfIJFnYlzoaMw77hYlyNbDQgEJrRQbshXQz1/umVFmX3DsukEkDCxpevLezdCE4EJj3d0mb8MuOjzQNuSL3k37fij3ze951KYndhHaB6peTzL9sY9TB5ROIbRTZjcka8PHILpujSaG2SyT4/rw57t8yaRuF3fOw7xNiNeMMKEAwqN/ofsv28mSL3t42qgWZF9LHl3tu9rt/JHk7Jun3sdzbqzIDChnUWLtXq7GF2GsDzu+GPnXb2jMn+GsYfQvOnqxc4gMOFw7rMB1s7t6RGOzh+JKaw206W9Xv8Hj80ru4BHFoq/ZT9f+gxB8GWIWbHxnmrXYXnf1/Oj8UUC4bO7XA0of4TmterJU2fSD7QPy86XvMt6WAc5se3hPnDX71oc5WpAIDBBWO5bhkdxKRkEJjzesOxrFZ/Xh14TuK/3cx76bSAgMOH5hOVgzzRuyhSe0Rzd4zAwRmbJQr1gmfYQllk2/AIAfa0GdKrWIDDh+YVlH+vD5iOxQVfLKSyht+ohNGdqDwITnldYjm7Jux5Cs+vVgII7qwHxpNoD9zABwAgTAAQmAAhMABCYACAwAUBgAoDABAAEJgAITAAQmAAgMAFAYAKAwAQAgQkACEwAEJgAIDABQGACgMAEAIEJAAITAAQmACAwAUBgAoDABACBCQACEwAEJgAITABAYAKAwAQAgQkAAhMABCYACEwAEJgAgMAEAIEJAAITAAQmAAhMABCYACAwAUBgAgACEwAEJgAITAAQmAAgMAFAYAKAwAQABCYACEwAEJgAIDABQGACgMAEAIEJAAhMABCYACAwAUBgAoDABACBCQACEwAEJgAgMAFAYAKAwAQAgQkAAhMABCYACEwAQGACgMAEAIEJAAITAAQmAAhMABCYACAwAQCBCQACEwAEJgCMxf8LMAAUVdYA3E4MgwAAAABJRU5ErkJggg==";
        //doc.addImage(logoimage, "PNG", 10, -20, 280, 120);
        // doc.addPage();
        doc.addImage(img, "JPEG", 2, 75, canvas.width - 10, canvas.height - 50, '', 'FAST');
        doc.setFont("times", "bold");
        doc.setFontSize(100);
        doc.setTextColor(108, 125, 145);
        // alert(doc.internal.pageSize.width);
        // alert(doc.getStringUnitWidth(hdrtxt));
        // var xOffset = (doc.internal.pageSize.width / 2) - (doc.getStringUnitWidth(hdrtxt) * doc.internal.getFontSize() / 2);
        var xOffset = (doc.internal.pageSize.width / 2) - (doc.internal.getFontSize() * 2);
        // alert("Xoffset::"+xOffset)
        doc.text(hdrtxt, xOffset, 50);
        doc.save("Resultsfile.pdf");
        document.body.removeChild(canvas);
        $("#pageloaddiv").hide();
        $(".exprtbtn").css("display", "block");
        $(".exprtitems").css("display", "block");
        $("#scnripBox").css("display", "none");
        $("#optimscnripBox").css("display", "none");
        $("#scnrcompinputBox").css("display", "none");
        $("#compscnrbtnboxThree").css("display", "");
        $("#" + cid).find('.screenShotTempCanvas').remove();
        $("#" + cid).find('.tempHide').show().removeClass('tempHide');
    });
}