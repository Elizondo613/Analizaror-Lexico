document.getElementById('fileInput').addEventListener('change', handleFileSelect);
document.getElementById('analyzeButton').addEventListener('click', analyzeContent);
let fileContent = '';

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            fileContent = e.target.result;
            document.getElementById('fileContent').textContent = fileContent;
        };
        reader.readAsText(file);
    }
}

function analyzeContent() {
    const tokens = tokenize(fileContent);
    displayTokens(tokens);
    const parseResult = parseTokens(tokens);
    displayParseResult(parseResult);
}

function tokenize(text) {
    const tokensDef = {
        'entero': 'Palabra Reservada',
        'decimal': 'Palabra Reservada',
        'booleano': 'Palabra Reservada',
        'cadena': 'Palabra Reservada',
        'si': 'Palabra Reservada',
        'sino': 'Palabra Reservada',
        'mientras': 'Palabra Reservada',
        'hacer': 'Palabra Reservada',
        'verdadero': 'Palabra Reservada',
        'falso': 'Palabra Reservada',
        '+': 'Operador',
        '-': 'Operador',
        '*': 'Operador',
        '/': 'Operador',
        '%': 'Operador',
        '=': 'Operador',
        '==': 'Operador',
        '<': 'Operador',
        '>': 'Operador',
        '>=': 'Operador',
        '<=': 'Operador',
        '(': 'Signos',
        ')': 'Signos',
        '{': 'Signos',
        '}': 'Signos',
        '"': 'Signos',
        ';': 'Signos',
    };

    const tokenCounts = [];
    // Escapamos los operadores para la expresión regular
    const regex = new RegExp(Object.keys(tokensDef).map(token => token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + '|\\s+|\\S+', 'g');

    const matches = text.match(regex);
    if (matches) {
        matches.forEach(match => {
            if (tokensDef[match]) {
                tokenCounts.push({ token: match, type: tokensDef[match] });
            } else if (/\w+/.test(match)) { // Para detectar identificadores
                tokenCounts.push({ token: match, type: 'Identificador' });
            } else if (match.trim() !== '') {
                console.warn(`Error léxico: token "${match}" no reconocido`);
            }
        });
    }
    return tokenCounts;
}

function displayTokens(tokens) {
    const tableBody = document.querySelector('#tokenTable tbody');
    tableBody.innerHTML = '';
    tokens.forEach(token => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${token.token}</td><td>${token.type}</td>`;
        tableBody.appendChild(row);
    });
}

function parseTokens(tokens) {
    const errors = [];
    const parsedStructures = [];
    let i = 0;

    function expect(tokenType) {
        if (i < tokens.length && tokens[i].type === tokenType) {
            return tokens[i++].token;
        } else {
            const token = i < tokens.length ? tokens[i].token : 'EOF';
            errors.push(`Error sintáctico: se esperaba ${tokenType} pero se encontró "${token}"`);
            return null;
        }
    }

    while (i < tokens.length) {
        const token = tokens[i];

        // Declaración de variables
        if (token.type === 'Palabra Reservada' && ['entero', 'decimal', 'booleano', 'cadena'].includes(token.token)) {
            const varType = expect('Palabra Reservada');
            const varName = expect('Identificador');
            if (varType && varName) {
                parsedStructures.push(`Variable declarada: ${varType} ${varName}`);
                expect('Signos'); // Se espera ';'
                continue; // Continua para evitar procesar el siguiente token
            }
        }

        // Condicionales si (if), si no (else)
        else if (token.token === 'si') {
            expect('Palabra Reservada');
            expect('Signos'); // '('
            expect('Signos'); // ')'
            expect('Signos'); // '{'
            parsedStructures.push('Estructura condicional if verificada');
            expect('Signos'); // '}'
            if (i < tokens.length && tokens[i].token === 'sino') {
                expect('Palabra Reservada'); // 'sino'
                expect('Signos'); // '{'
                parsedStructures.push('Estructura condicional else verificada');
                expect('Signos'); // '}'
            }
            continue; // Continua
        }

        // Bucle mientras (while)
        else if (token.token === 'mientras') {
            expect('Palabra Reservada');
            expect('Signos'); // '('
            expect('Signos'); // ')'
            expect('Signos'); // '{'
            parsedStructures.push('Bucle while verificado');
            expect('Signos'); // '}'
            continue; // Continua
        }

        // Declaración de funciones
        else if (token.token === 'funcion') {
            expect('Palabra Reservada');
            const funcName = expect('Identificador'); // Nombre de la función
            expect('Signos'); // '('
            const paramType1 = expect('Palabra Reservada'); // Tipo del primer parámetro
            const paramName1 = expect('Identificador'); // Nombre del primer parámetro
            expect('Signos'); // ',' o ')'
            if (tokens[i] && tokens[i].token === ',') {
                expect('Signos'); // ','
                const paramType2 = expect('Palabra Reservada'); // Tipo del segundo parámetro
                const paramName2 = expect('Identificador'); // Nombre del segundo parámetro
                parsedStructures.push(`Declaración de función verificada: ${funcName}(${paramType1} ${paramName1}, ${paramType2} ${paramName2})`);
            } else {
                parsedStructures.push(`Declaración de función verificada: ${funcName}(${paramType1} ${paramName1})`);
            }
            expect('Signos'); // ')'
            expect('Signos'); // '{'
            expect('Signos'); // '}'
            continue; // Continua
        }

        // Si no se reconoce la estructura
        i++;
    }

    return errors.length > 0 ? { errors } : { parsedStructures };
}

function displayParseResult(result) {
    const resultContainer = document.getElementById('parseResult');
    resultContainer.innerHTML = '';

    if (result.errors) {
        result.errors.forEach(error => {
            const errorElement = document.createElement('p');
            errorElement.textContent = error;
            errorElement.style.color = 'red';
            resultContainer.appendChild(errorElement);
        });
    } else {
        const successElement = document.createElement('p');
        successElement.textContent = 'Análisis sintáctico completado sin errores.';
        successElement.style.color = 'green';
        resultContainer.appendChild(successElement);

        result.parsedStructures.forEach(structure => {
            const structureElement = document.createElement('p');
            structureElement.textContent = structure;
            resultContainer.appendChild(structureElement);
        });
    }
}
