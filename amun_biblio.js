var un_documents = [];
var other_documents = [];
var author_p = 1;
var author_o = 1;

var curBib = 'undoc';


function selectDocType() {
    var dropdown = document.getElementById('bibtype');
    var changeTo = dropdown.options[dropdown.selectedIndex].value;
    document.getElementById(changeTo).style.display = 'block';
    document.getElementById(curBib).style.display = 'none';
    curBib = changeTo;
}
window.onload = function () {
    document.getElementById('bibtype').addEventListener('change',selectDocType);
}

function unDoc() {
    
    var formvals = document.getElementById('undoc_form').elements;
    var body = formvals[0].value;
    var title = formvals[1].value;
    var month = formvals[2].value; 
    var day = formvals[3].value;
    var year = formvals[4].value;
    var doc_number = formvals[5].value;
    var url = formvals[6].value;
    
    // First we validate
    var error_msg = '';
    var error_level = 0; // 0 is fine, 1 is warning, 2 is error
    // What is required?
    // The UN Body should always be there
    if (body === '') {
        error_msg += 'Error: No United Nations body specified\n';
        error_level = Math.max(error_level, 2);
    }
    // The Title should always be there
    if (title === '') {
        error_msg += 'Error: Document title missing\n';
        error_level = Math.max(error_level, 2);
    }
    // The month is not necessary, but must be between 1 and 12
    var result = validate_date(month, day, year);
    var datestring = result['datestring'];
    var yearstring = result['yearstring'];
    day = result['day'];
    month = result['month'];
    year = result['year'];
    
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    // Do a simple check to make sure this isn't a draft
    if (doc_number.match(/L\.[0-9]+/g) !== null ) {
        error_msg += 'Warning: Doc numbers ending in L.XX are typically draft resolutions, please use the final form.\n';
        error_level = Math.max(error_level, 1);
    }
    
    result = validate_url(url);
    url = result['url'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    var all_good = true;
    if (error_level == 1) {
        all_good = confirm(error_msg + '\n\nContinue despite these problems?');
    } else if (error_level == 2) {
        all_good = false
        alert(error_msg);
    }
    if (!all_good) {
        document.getElementById('errors').innerHTML = '<table border="2"><tr><td>' + error_msg.split('\n').join('<br>') + '</td></tr></table>';
        return;
    } else {
        document.getElementById('errors').innerHTML = '';
    }
    
    var bib_entry = [];
    bib_entry['text'] = 'United Nations, ' + body + yearstring + (url.length > 0? '. <a href="' + url + '">':'') + title + (url.length >0?'</a>.':'.') + datestring + (doc_number.length > 0 ? ' ' + doc_number + "." : '');

    bib_entry['body'] = body;
    bib_entry['day'] = day;
    bib_entry['month'] = month;
    bib_entry['year'] = year;
    
    addUNDocument(bib_entry);
    update();
    resetAuthors();
    document.getElementById('undoc_form').reset()
}

function periodical() {
    
    var formvals = document.getElementById('periodical_form').elements;
    var title = formvals.namedItem('title').value;
    var month = formvals.namedItem('month').value; 
    var day = formvals.namedItem('day').value;
    var year = formvals.namedItem('year').value;
    var url = formvals.namedItem('link').value;
    var publication = formvals.namedItem('publication').value;
    var volinfo = formvals.namedItem('volinfo').value;
    var pages = formvals.namedItem('pages').value;
    
    var authors = [];
    for (var i=1;i<=author_p;i++) {
        authors.push([formvals.namedItem('firstname'+ i).value, formvals.namedItem('lastname'+i).value]);
    }
    
    // First we validate
    var error_msg = '';
    var error_level = 0; // 0 is fine, 1 is warning, 2 is error
    // What is required?
 
    // The Title should always be there
    if (title === '') {
        error_msg += 'Error: Document title missing\n';
        error_level = Math.max(error_level, 2);
    }
    // The month is not necessary, but must be between 1 and 12
    var result = validate_date(month, day, year);
    var datestring = result['datestring'];
    var yearstring = result['yearstring'];
    day = result['day'];
    month = result['month'];
    year = result['year'];
    
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    result = validate_publication(publication, volinfo, pages, true); // make this
    var pubstring = result['pubstring'];
    var pagestring = result['pagestring'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
   
    result = validate_url(url);
    url = result['url'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    var titlestring = '<a href="' + url + '">' + title + '</a>';
    
    result = validate_authors(authors, titlestring); // make this
    autstring = result['autstring'];
    titlestring = result['titlestring'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);    
    
    
    
    var all_good = true;
    if (error_level == 1) {
        all_good = confirm(error_msg + '\n\nContinue despite these problems?');
    } else if (error_level == 2) {
        all_good = false
        alert(error_msg);
    }
    if (!all_good) {
        document.getElementById('errors').innerHTML = '<table border="2"><tr><td>' + error_msg.split('\n').join('<br>') + '</td></tr></table>';
        return;
    } else {
        document.getElementById('errors').innerHTML = '';
    }
    
    var bib_entry = [];
    bib_entry['text'] = autstring + yearstring + (titlestring.length > 0? '. ':'') + titlestring + '.' + pubstring + datestring + pagestring;

    bib_entry['body'] = autstring;
    bib_entry['day'] = day;
    bib_entry['month'] = month;
    bib_entry['year'] = year;
    
    addNonUNDocument(bib_entry);
    update();
    resetAuthors();
    document.getElementById('periodical_form').reset()
}


function treaty() {
    
    var formvals = document.getElementById('treaty_form').elements;
    var title = formvals.namedItem('title').value;
    var year = formvals.namedItem('year').value;
    var url = formvals.namedItem('link').value;

    // First we validate
    var error_msg = '';
    var error_level = 0; // 0 is fine, 1 is warning, 2 is error
    // What is required?
 
    // The Title should always be there
    if (title === '') {
        error_msg += 'Error: Document title missing\n';
        error_level = Math.max(error_level, 2);
    }
    // The month is not necessary, but must be between 1 and 12
    var result = validate_date('', '', year);
    var yearstring = result['yearstring'];
    year = result['year'];
    
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);

    result = validate_url(url);
    url = result['url'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    var titlestring = '<a href="' + url + '">' + title + '</a>';
    

    
    
    var all_good = true;
    if (error_level == 1) {
        all_good = confirm(error_msg + '\n\nContinue despite these problems?');
    } else if (error_level == 2) {
        all_good = false
    }
    if (!all_good) {
        document.getElementById('errors').innerHTML = '<table border="2"><tr><td>' + error_msg.split('\n').join('<br>') + '</td></tr></table>';
        return;
    } else {
        document.getElementById('errors').innerHTML = '';
    }
    
    var bib_entry = [];
    bib_entry['text'] = titlestring + yearstring + '.';

    bib_entry['body'] = titlestring;
    bib_entry['day'] = 1;
    bib_entry['month'] = 1;
    bib_entry['year'] = year;
    
    addNonUNDocument(bib_entry);
    update();
    resetAuthors();
    document.getElementById('treaty_form').reset()
}

function other() {
    
    var formvals = document.getElementById('other_form').elements;
    var title = formvals.namedItem('title').value;
    var month = formvals.namedItem('month').value; 
    var day = formvals.namedItem('day').value;
    var year = formvals.namedItem('year').value;
    var url = formvals.namedItem('link').value;
    var publication = formvals.namedItem('publication').value;
    var volinfo = '';
    var pages = '';
    var organization = formvals.namedItem('organization').value;
    
    var authors = [];
    for (var i=1;i<=author_o;i++) {
        authors.push([formvals.namedItem('firstname'+ i).value, formvals.namedItem('lastname'+i).value]);
    }
    
    // First we validate
    var error_msg = '';
    var error_level = 0; // 0 is fine, 1 is warning, 2 is error
    // What is required?
 
    // The Title should always be there
    if (title === '') {
        error_msg += 'Error: Document title missing\n';
        error_level = Math.max(error_level, 2);
    }
    // The month is not necessary, but must be between 1 and 12
    var result = validate_date(month, day, year);
    var datestring = result['datestring'];
    var yearstring = result['yearstring'];
    day = result['day'];
    month = result['month'];
    year = result['year'];
    
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    result = validate_publication(publication, volinfo, pages, false); // make this
    var pubstring = result['pubstring'];
    var pagestring = result['pagestring']
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
   
    result = validate_url(url);
    url = result['url'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    var titlestring = '<a href="' + url + '">' + title + '</a>';
    
    result = validate_authors(authors, organization); // make this
    autstring = result['autstring'];
    organization = result['titlestring'];
    if (autstring.length == 0) {
        autstring = titlestring;
        titlestring = '';
    }
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);    
    
    
    
    var all_good = true;
    if (error_level == 1) {
        all_good = confirm(error_msg + '\n\nContinue despite these problems?');
    } else if (error_level == 2) {
        all_good = false
        alert(error_msg);
    }
    if (!all_good) {
        document.getElementById('errors').innerHTML = '<table border="2"><tr><td>' + error_msg.split('\n').join('<br>') + '</td></tr></table>';
        return;
    } else {
        document.getElementById('errors').innerHTML = '';
    }
    
    var bib_entry = [];
    bib_entry['text'] = autstring + yearstring + (titlestring.length > 0? '. ':'') + titlestring + '.' + pubstring + datestring + pagestring;

    bib_entry['body'] = autstring;
    bib_entry['day'] = day;
    bib_entry['month'] = month;
    bib_entry['year'] = year;
    
    addNonUNDocument(bib_entry);
    update();
    resetAuthors();
    document.getElementById('other_form').reset()
}


function validate_authors(authors, title) {
    // Question: Are authors listed in alphabetical order by last name?
    // We'll just assume no for now
    var autstring = '', error_msg = '', error_level = 0, titlestring = title;
    // Check that the first author is ok
    var firstname, lastname;
    
    firstname = authors[0][0];
    lastname = authors[0][1];
    
    if (firstname.length == 0 && lastname.length == 0) {
        autstring = title;
        titlestring = '';
    } else if (firstname.length == 0) {
        error_msg += 'Error: First author missing a first name\n';
        error_level = 2;
    } else {
        if (lastname.length > 0) {
            autstring = lastname + ', ';
        }
        autstring += firstname;
    }
    
    var author_count = 0;
    for (var i=0; i<authors.length; i++) {
        if (authors[i][0].length > 0) {
            author_count += 1;
        }
    }
    if (author_count == 2) {
        firstname = authors[1][0];
        lastname = authors[1][1];
        autstring += ', and ' + firstname;
        if (lastname.length > 0) {
            autstring += ' ' + lastname;
        }
    } else if (author_count > 2) {
        autstring += ', et al.'
    }
    
    var result = [];
    result['autstring'] = autstring;
    result['titlestring'] = titlestring;
    result['error_msg'] = error_msg;
    result['error_level'] = error_level;
    return result;
}


function validate_date(month, day, year) {
    var error_msg = '';
    var error_level = 0;
    var datestring = '';
    var yearstring = '';
    var valid_months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var valid_month = false;
    var valid_day = false;
    
    if (month.length > 0) {
        var month_id = parseInt(month);
        if (isNaN(month)) {
            var isValid = false;
            for (var i = 0; i < valid_months.length; i++) {
                if (valid_months[i].toLowerCase() === month.toLowerCase()) {
                    isValid = true;
                    month = valid_months[i];
                    month_id = i;
                    valid_month = true;
                    break;
                }
            }
            if (!isValid) {
                error_msg += 'Error: Invalid month - ' + month + '.\n';
                error_level = Math.max(error_level, 2);
                    
            }
            
        } else {
            if (month_id > 0 && month_id < 13) {
                month = valid_months[month_id-1];
                valid_month = true;
            } else {
                error_msg += 'Error: Invalid month - ' + month + '.\n';
                error_level = Math.max(error_level, 2);
                month = ''
            }
        }
    }
    
    if (day.length > 0) {
        var day_id = parseInt(day);
        if (isNaN(day_id) || day_id < 1 || day_id > 31) {
            error_msg += 'Error: Invalid day - ' + day + '.\n';
            error_level = Math.max(error_level, 2);
        } else {
            valid_day = true;
        }
        day = day_id;
    }
    
    if (valid_month) {
        datestring = ' ' + day + (isNaN(day)?'':' ') + month + '.';
    }
    
    if (year.length > 0) {
        var year_id = parseInt(year);
        if (isNaN(year_id) || year_id < 1000 || year_id > 2100) { // should be good for a while
            error_msg += 'Error: Invalid year - ' + year + '.\n';
            error_level = Math.max(error_level, 2);
        } else {
            year = year_id;
            
            yearstring = ' (' + year + ')';

        }
        
    }
    var result = [];
    result['datestring'] = datestring;
    result['yearstring'] = yearstring;
    result['year'] = year;
    result['month'] = month_id;
    result['day'] = day_id;
    result['error_msg'] = error_msg;
    result['error_level'] = error_level;
    return result;
    
}

function validate_publication(publication, volinfo, pages, italicize) {
    var error_msg = '', error_level = 0, pubstring = '', pagestring = '';
    if ( (volinfo.length > 0 || pages.length > 0) && publication.length == 0) {
        error_msg += 'Error: Volume and/or page information given without publication.\n';
        error_level = 2;
    } else {
        if (publication.length > 0) {
            pubstring = ' ' +  (italicize?'<i>':'') + publication + (italicize?'</i>':'');
            if (volinfo.length > 0) {
                pubstring += ', ' + volinfo + (volinfo.charAt(volinfo.length-1) === '.'? '':'.');
            } else {
                pubstring += '.';
            }
            if (pages.length >0) {
                pagestring += ' ' + pages + (pages.charAt(pages.length-1) === '.'?'':'.');
            }
        }
    }
    
    var result = [];
    result['pubstring'] = pubstring;
    result['pagestring'] = pagestring;
    result['error_msg'] = error_msg;
    result['error_level'] = error_level;
    return result;
}

function validate_url(url) { // lol I'm not writing this
    var error_msg = '';
    var error_level = 0;
    if ( url.length === 0) {
        error_msg = 'Warning: It is uncommon for there to be no URL.\n';
        error_level = 1;
    }
    var result = [];
    result['url'] = url;
    result['error_msg'] = error_msg;
    result['error_level'] = error_level;
    return result;
    
}


function addAuthorP() {
    var table = document.getElementById('periodical_table');
    var row = table.insertRow(author_p++);
    var label = row.insertCell(0);
    var input = row.insertCell(1);
    label.innerHTML = 'Author ' + author_p + ':';
    input.innerHTML = "<input type='text' name='firstname" + author_p + "' placeholder='First'> <input type='text' name='lastname" + author_p + "' placeholder='Last'>";
}

function addAuthorO() {
    var table = document.getElementById('other_table');
    var row = table.insertRow(author_o++);
    var label = row.insertCell(0);
    var input = row.insertCell(1);
    label.innerHTML = 'Author ' + author_o + ':';
    input.innerHTML = "<input type='text' name='firstname" + author_o + "' placeholder='First'> <input type='text' name='lastname" + author_o + "' placeholder='Last'>";
}

function resetAuthors() {
    table = document.getElementById('other_table');
    for (;author_o > 1; author_o--) {
        table.deleteRow(1);
    }
    table = document.getElementById('periodical_table');
    for (;author_p > 1; author_p--) {
        table.deleteRow(1);
    }
    
}


function lessthan(one, other) {
    if (one['body'] < other['body']) {
            return true;
    } else if (one['body'] === other['body']) {
        if (one['year'] > other['year']) {
            return true;
        } else if (one['year'] === other['year']) {
            if (one['month'] > other['month']) {
                return true;
            } else if (one['month'] === other['month']) {
                if (one['day'] > other['day']) {
                    return true;
                } else if (one['day'] > other['day']) {
                    if (one['text'] < other['text']) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}



function addUNDocument(bib_entry) {
    var i = 0;
    for (i; i<un_documents.length; i++) {
        if (lessthan(bib_entry, un_documents[i])) {
            break;
        }
    }
    un_documents.splice(i, 0, bib_entry);
    
}

function addNonUNDocument(bib_entry) {
    var i=0;
    for (i; i<other_documents.length; i++) {
        if (lessthan(bib_entry, other_documents[i])) {
            break;
        }
    }
    other_documents.splice(i, 0, bib_entry);
}


function update() {
    var bibtext = 'Bibliography<br><br>'
    for (var i=0; i < other_documents.length; i++) {
        bibtext += other_documents[i]['text'] + '<br><br>';
    }
    bibtext += 'United Nations Documents:<br><br>';
    for (var i=0; i<un_documents.length; i++) {
        bibtext += un_documents[i]['text'] + '<br><br>';
    }
    document.getElementById('output').innerHTML = bibtext;
}