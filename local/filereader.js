
function loadData(file, callback) {
    var reader = new FileReader();
    
    
    reader.onload = function(evt) {
        console.log("Result:" + evt.target.result);
        callback(JSON.parse(evt.target.result));
    }

    reader.onerror = function(evt) {
        console.log("Error: ");
    }
    
    reader.readAsText(file);
}

var testData = undefined;

$().ready(function() {
    $('#file').change(function(evt) {
        if (evt.target.files.length > 0) {
            loadData(evt.target.files[0], function(result) {
                testData = result;
            });
        }
    });
});

