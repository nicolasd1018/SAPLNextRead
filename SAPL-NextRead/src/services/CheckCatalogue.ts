import { PythonShell } from "python-shell";
const checkCatalogue = (title: string) => {
    const pyshell = new PythonShell('Web_Scraper/web_scaper.py');

    pyshell.send(JSON.stringify([title.replaceAll(' ', '%20')]))
    
    pyshell.on('message', function(message) {
    console.log(typeof(message))
    return message === 'True';
    })
    
    pyshell.end(function (err) {
    if (err){
        throw err;
    };
    });
    return false;
}

export default checkCatalogue