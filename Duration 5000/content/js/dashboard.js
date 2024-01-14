/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 91.704, "KoPercent": 8.296};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.77624, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7381, 500, 1500, "http://localhost:3001/characters/character/id"], "isController": false}, {"data": [0.8873, 500, 1500, "http://localhost:3001/characters/character"], "isController": false}, {"data": [0.90705, 500, 1500, "http://localhost:3001/characters/character/id (delete)"], "isController": false}, {"data": [0.89805, 500, 1500, "http://localhost:3001/characters/character/id (put)"], "isController": false}, {"data": [0.4507, 500, 1500, "http://localhost:3001/characters"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 50000, 4148, 8.296, 3034.983140000018, 1, 67359, 12.0, 17237.60000000002, 32318.800000000003, 49439.98, 675.7578624427296, 1367.467292791522, 118.73868105580408], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["http://localhost:3001/characters/character/id", 10000, 629, 6.29, 1982.728900000002, 1, 66285, 138.5, 7068.699999999999, 12370.349999999964, 30905.789999999994, 135.86218140318462, 54.616543852915605, 15.791908812700397], "isController": false}, {"data": ["http://localhost:3001/characters/character", 10000, 471, 4.71, 615.2404000000017, 2, 33696, 18.0, 685.0, 1047.949999999999, 30103.869999999995, 136.2119457876456, 49.81389244789893, 28.899971480623847], "isController": false}, {"data": ["http://localhost:3001/characters/character/id (delete)", 10000, 226, 2.26, 387.1231000000004, 1, 32947, 12.0, 622.0, 917.0, 8564.739999999994, 136.9394043135912, 40.49482732796987, 32.93831307771311], "isController": false}, {"data": ["http://localhost:3001/characters/character/id (put)", 10000, 364, 3.64, 619.1762000000007, 1, 33580, 16.0, 716.0, 881.0, 30216.989999999998, 136.55232685164955, 46.560982988993885, 29.426012962229628], "isController": false}, {"data": ["http://localhost:3001/characters", 10000, 2458, 24.58, 11570.647100000007, 1, 67359, 768.0, 32280.9, 37614.499999999985, 65059.89, 135.16984090509726, 1177.8199913660264, 12.723653285978834], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 66,285 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,234 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 3, 0.07232401157184185, 0.006], "isController": false}, {"data": ["The operation lasted too long: It took 67,290 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,343 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 65,488 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,136 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,215 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,337 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 3, 0.07232401157184185, 0.006], "isController": false}, {"data": ["The operation lasted too long: It took 66,228 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 64,821 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,142 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2699, 65.06750241080039, 5.398], "isController": false}, {"data": ["The operation lasted too long: It took 64,678 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 64,711 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,124 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,229 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,240 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,354 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,135 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,199 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,285 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,222 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 4, 0.09643201542912247, 0.008], "isController": false}, {"data": ["The operation lasted too long: It took 66,239 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,144 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,125 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,278 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,242 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1318, 31.774349083895853, 2.636], "isController": false}, {"data": ["The operation lasted too long: It took 65,060 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 65,492 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,259 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,223 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 65,049 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,152 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,320 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,146 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,205 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,230 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,133 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 67,359 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,049 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,127 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,333 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 3, 0.07232401157184185, 0.006], "isController": false}, {"data": ["The operation lasted too long: It took 66,140 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,353 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,238 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 67,288 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,134 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,147 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 64,675 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,250 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,281 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,115 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,128 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,225 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,341 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 64,738 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,138 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 5, 0.12054001928640308, 0.01], "isController": false}, {"data": ["The operation lasted too long: It took 66,245 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,216 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,131 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,119 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,283 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,129 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 3, 0.07232401157184185, 0.006], "isController": false}, {"data": ["The operation lasted too long: It took 66,226 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 67,350 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,139 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 64,739 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,220 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 67,339 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,246 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,236 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,151 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 2, 0.048216007714561235, 0.004], "isController": false}, {"data": ["The operation lasted too long: It took 66,132 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 64,742 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,217 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,291 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 66,227 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["The operation lasted too long: It took 67,349 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 22, 0.5303760848601736, 0.044], "isController": false}, {"data": ["The operation lasted too long: It took 66,324 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, 0.024108003857280617, 0.002], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 50000, 4148, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 2699, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 1318, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 22, "The operation lasted too long: It took 66,138 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 5, "The operation lasted too long: It took 66,222 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 4], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["http://localhost:3001/characters/character/id", 10000, 629, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 359, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 269, "The operation lasted too long: It took 66,285 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 1, "", "", "", ""], "isController": false}, {"data": ["http://localhost:3001/characters/character", 10000, 471, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 240, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 231, "", "", "", "", "", ""], "isController": false}, {"data": ["http://localhost:3001/characters/character/id (delete)", 10000, 226, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 161, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 65, "", "", "", "", "", ""], "isController": false}, {"data": ["http://localhost:3001/characters/character/id (put)", 10000, 364, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 241, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 123, "", "", "", "", "", ""], "isController": false}, {"data": ["http://localhost:3001/characters", 10000, 2458, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 1797, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:3001 [localhost/127.0.0.1, localhost/0:0:0:0:0:0:0:1] failed: Connection refused: connect", 531, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: localhost:3001 failed to respond", 22, "The operation lasted too long: It took 66,138 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 5, "The operation lasted too long: It took 66,222 milliseconds, but should not have lasted longer than 60,000 milliseconds.", 4], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
