// On récupère le contenu de js/app.js
export const fileContent = await window.fs.readFile('js/app.js', 'utf8');
