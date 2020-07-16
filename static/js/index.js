
        var time=0;
        data0={};
        var date = new Date();
        var time = Date.UTC (date.getFullYear(),date.getMonth(),date.getDay(),date.getHours()-5,date.getMinutes()-30,date.getSeconds(),date.getMilliseconds())
        //console.log(t);

        console.log(time);
        var dps=[{x:time,y:0}],dps1=[{x:time,y:50}],dps2=[{x:time,y:50}]
        
        status=false;
        var chart = new CanvasJS.Chart("chartContainer", {
        axisX:{
        title: "time",
        gridThickness: 1,
        interval:5, 
        intervalType: "second",        
        valueFormatString: "hh :mm :ss TT", 
        },
	      axisY: {
          title:"People Count",
          includeZero: false,
          interval: 1
	      },      
	      data: [{
		      xValueFormatString: "hh:mm:ss",
		      type: "line",
		      dataPoints: dps
	      }]
        });

          $('#videosource').change(function(event){
            let xhr = new XMLHttpRequest(); 
            let url = "/camera"; 
            
            // open a connection 
            xhr.open("POST", url, true); 
  
            // Set the request header i.e. which type of content you are sending 
            xhr.setRequestHeader("Content-Type", "application/json"); 
  
            // Create a state change callback 
         
  
            // Converting JSON data to string 
            var selectindex= document.getElementById("videosource").selectedIndex;
            var opt  =document.getElementById("videosource").options;
            var data = JSON.stringify({ name:  opt[selectindex].index }); 
            console.log( opt[selectindex]);
            // Sending data with the request 
            xhr.send(data); 
          });
           

        navigator.mediaDevices.enumerateDevices().then(function (devices) {
            for(var i = 0; i < devices.length; i ++){
                var device = devices[i];
                if (device.kind === 'videoinput') {
                    var option = document.createElement('option');
                    option.value = device.deviceId;
                    option.text = device.label || 'camera ' + (i + 1);
                    $('#videosource').append(option);
                }
            };
        })
        $("#Status").html('Status : <span class="red">Not Running</span>');
        var myImg = document.querySelector("#feed");
        var realWidth = myImg.clientWidth;
        var realHeight = myImg.clientHeight;
        $("#Resolution").html('Resolution :'+ realWidth +' x ' +realHeight);
        $.getJSON( "./FINAL/src/statusdata.json", function( data ) {
        if(data[0]['status']){
          $("#gpu").html('GPU : <span class="green">Enabled</span>');
        }
        else{
        $("#gpu").html('GPU : <span class="red">Disabled</span>');
        }
        });

        var mcount = 0, fcount = 0;
        var attencount = 0, nonattencount = 0;
        var attenchart = new CanvasJS.Chart("attentiveness", {
        axisX:{
        title: "time",
        interval:10, 
        intervalType: "second",        
        valueFormatString: "hh :mm :ss TT", 
        },
	      axisY: {
          title:"Attentiveness Evaluation Percentage",
          maximum: 100,
          includeZero: true,
          interval: 10,
          
	      },      
	      data: [
        {
          xValueFormatString: "hh:mm:ss",
		      yValueFormatString: "Attentive ##0",
          type: "spline",
          color: "#14e34b",
          showInLegend: true,
          legendText: "Attentive",
		      dataPoints: dps1
        }
        // {
        // xValueFormatString: "hh:mm:ss",
		    // yValueFormatString: "Not Attentive ##0",
        // type :"spline",
        // color: "#e30b13",
        // showInLegend: true,
        // legendText: "Not Attentive",
        // dataPoints :dps2
        // }

      ]
        });
        chart.render();
        attenchart.render();
     
// -------------------------------
// gender pie-chart
  $('<canvas id="pieChart"></canvas>').appendTo($("#gender"));
        data2={};
        data2.labels=["Male", "Female"];
        data2.datasets=[
           {backgroundColor:["#213ceb","#f562ba"],data: [50, 50]}
        ];

       var ctx = $("#pieChart").get(0).getContext("2d");
          var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: data2,
            
           });


     
        setInterval(function(){ $.getJSON( "./FINAL/src/4forces.json", function( data ) {

          if(status){
            $("#Status").html('Status : <span class="green"> Running</span>');
          }
          else{
            $("#Status").html('Status : <span class="red">Not Running</span>');
          }
          var currentmcount=0,currentnonattentcount=0;
        for (index = 0; index < data.length; index++) { 

        // attentive-counter
        if(data[index]['attentive'] == false){

          currentnonattentcount+=1;
          nonattencount += 1;
        }
        // else{
        //   nonattencount += 1;
        // }
        // ----------------
        // man-counter
        if(data[index]['gender'] == 'man'){
          mcount += 1;
          currentmcount+=1;
        }

      }

        attencount += data.length - currentnonattentcount; 
        fcount += data.length - currentmcount;
        var totcount = data.length;
        var date = new Date();
        var time = Date.UTC (date.getFullYear(),date.getMonth(),date.getDay(),date.getHours()-5,date.getMinutes()-30,date.getSeconds(),date.getMilliseconds())
        //console.log(t);

      //-------------------------------------------------
      
    // ----------------------
  
      // Count vs time line graph
 
        function updateChart(count,dataLength){
          dps.push({
			      x: new Date(time ),
			      y: totcount
          });
          if(dps.length>dataLength){
            dps.shift();
          }

	        chart.render();
        }
        updateChart(totcount,20);
      //-------------------------------------------------
      
        function toDataURL(url, callback) {
          var xhr = new XMLHttpRequest();
          xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
              $('#feed').attr('src',url);
              status=true;
           }
            reader.readAsDataURL(xhr.response);
        };
          xhr.open('GET', url);
          xhr.responseType = 'blob';
          xhr.send();
        }
      
        toDataURL('./../../bgr_img.jpg');
        });

        }, 1000);

    setInterval(function(){ $.getJSON( "./FINAL/src/4forces.json", function( data ) {
      
      var attenpercent=((attencount)/(attencount+nonattencount))*100;
      var nonattenpercent =100 -attenpercent;
      var mpercent=((mcount)/(mcount+fcount))*100
       var fpercent =100 -mpercent;
      console.log(mpercent+" "+ fpercent +" "+attenpercent +" "+  nonattenpercent );
    $("#gender").html("");

    $("#emotions").html("");
  
    // $('<canvas id="barGraph"></canvas>').appendTo($("#attentive"));
        // data1={};
        // data1.labels=["Attentive", "Not-Attentive"];
        // data1.datasets=[
          //  {backgroundColor:["#14e34b","#e30b13"],data: [attenpercent, nonattenpercent]}
        // ];
// 
      //  var ctx = $("#barGraph").get(0).getContext("2d");
          // var myChart = new Chart(ctx, {
            // type: 'bar',
            // data: data1,
            // options: {
                      // legend: {
                                // display: false
                      // },
                      // scales: {
                      // yAxes: [{
                        // ticks: {
// 
                          // beginAtZero: true  , 
                          // callback: function(value, index, values) {
                        // return  value+ '%';
                  // }
                // }
      // }]
  // }
            // }
          // });
          var date = new Date();
          var time = Date.UTC (date.getFullYear(),date.getMonth(),date.getDay(),date.getHours()-5,date.getMinutes()-30,date.getSeconds(),date.getMilliseconds())
        //console.log(t);


        function updateattenChart(attenpercent,nonattenpercent,dataLength){
          dps1.push({
			      x: new Date(time ),
			      y: attenpercent
          });
          // dps2.push({
			      // x: new Date(time ),
			      // y: nonattenpercent
          // });
          if(dps1.length>dataLength){
            dps1.shift();
            // dps2.shift();
          }

	        attenchart.render();
        }
        updateattenChart(attenpercent,nonattenpercent,10);
// -------------------------------
// gender pie-chart
  $('<canvas id="pieChart"></canvas>').appendTo($("#gender"));
        data2={};
        data2.labels=["Male", "Female"];
        data2.datasets=[
           {backgroundColor:["#213ceb","#f562ba"],data: [mpercent, fpercent]}
        ];

       var ctx = $("#pieChart").get(0).getContext("2d");
          var myChart = new Chart(ctx, {
            type: 'doughnut',
            data: data2,
            
           });
           mcount=0,fcount=0,attencount=0,nonattencount=0;
  });
   },10000);