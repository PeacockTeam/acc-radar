var CurrentEventsView = (function() {
    function getElement(modelEvent) {
        switch (modelEvent.type) {
            case "frontAccEvent": return $("#event-braking")
            case "backAccEvent": return $("#event-acceleration")
            case "rightAccEvent": return $("#event-left-cornering")
            case "leftAccEvent": return $("#event-right-cornering")
            case "speedEvent": return $("#event-speed")
            case "snatchPhoneEvent": return $("#event-snatch-phone")
        }
    }

    function hideAll() {
        $("#event-braking").hide();
        $("#event-acceleration").hide();
        $("#event-right-cornering").hide();
        $("#event-left-cornering").hide();
        $("#event-speed").hide();
        $("#event-snatch-phone").hide();
    }

    return {
        showEvents: function(modelEvents) {
            hideAll();
            modelEvents.forEach(function(modelEvent) {
                getElement(modelEvent).show();
            });
        } 
    };
})();

var ReportView = {
    showReport: function(report) {

        $('#report-entries').empty();
        
        $("#time-tmpl")
            .tmpl({
                start: (new Date(report.time.start)).toGMTString(),
                stop: (new Date(report.time.stop)).toGMTString(),
            })
            .appendTo("#report-entries");
        
        function addReportEntry(templData) {
            $("#acc-event-severity-score-tmpl")
                .tmpl(templData)
                .appendTo("#report-entries");
        }

        addReportEntry(_.extend(report.accelerations, { name: "Accelerations" }));
        addReportEntry(_.extend(report.brakings, { name: "Brakings" }));
        addReportEntry(_.extend(report.cornerings, { name: "Cornerings" }));
        addReportEntry(_.extend(report.speeds, { name: "Excess speed" }));
        
        $("#acc-event-total-score-tmpl")
            .tmpl({
                score: report.score.toFixed(2)
            })
            .appendTo("#report-entries");
    }
};
