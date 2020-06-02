var PythonShell = require('python-shell');


var getEmotion = () => {
    var options = {
        mode: 'text'
    };
    var pyshell = new PythonShell('./FINAL/src/main_temp_1.py', options);
    pyshell.on('message', message => console.log(message))
}


var getPeople = () => {
    var options = {
        mode: 'text'
    };
    var pyshell = new PythonShell('./people_count/people_count.py', options);
    pyshell.on('message', message => console.log(message))
}
// runShell();
//module.exports = {runShell, getEmotion, getAttentive, getPeople};
module.exports = { getEmotion,  getPeople};