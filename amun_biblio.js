var un_documents = [];
var other_documents = [];
var author_p = 1;
var author_o = 1;

var curBib = 'undoc';


function selectDocType() {
    var dropdown = document.getElementById('bibtype');
    var changeTo = dropdown.options[dropdown.selectedIndex].value;
    document.getElementById(changeTo).style.display = 'block';
    if (curBib != changeTo) 
      document.getElementById(curBib).style.display = 'none';
    curBib = changeTo;
}
window.onload = function () {
    document.getElementById('bibtype').addEventListener('change',selectDocType);
    selectDocType()
}

function unDoc() {
    
    var formvals = document.getElementById('undoc_form').elements;
    var body = formvals.namedItem("body").value;
    var title = formvals.namedItem("title").value;
    var year = formvals.namedItem("year").value;
    var doc_number = formvals.namedItem("docid").value;
    var url = formvals.namedItem("link").value;
    
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
    // The month and day are currently not expected
    var result = validate_date('', '', year);
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
    
    var bib_entry = {};
    bib_entry['text'] = 'United Nations, ' + body + yearstring + (url.length > 0? '. <a href="' + url + '"  target="_blank" rel="noopener noreferrer" >':'. ') + title + (url.length >0?'</a>.':'.') + (doc_number.length > 0 ? ' ' + doc_number + "." : '');

    bib_entry['body'] = body;
    bib_entry['year'] = year;

    bib_entry['title'] = title;
    bib_entry['doc_number'] = doc_number;
    bib_entry['link'] = url ? url : '';
    bib_entry['type'] = 'un';
    
    
    if (! addUNDocument(bib_entry))
        return;
    if (document.getElementById("currentlyEditing").value) {
        updateEdit()
    } else {
        update();
    }
    resetAuthors();
    document.getElementById('undoc_form').reset()
}

function periodical() {
    
    var formvals = document.getElementById('periodical_form').elements;
    var title = formvals.namedItem('title').value;
    var month_num = formvals.namedItem('month').value; 
    var day = formvals.namedItem('day').value;
    var year = formvals.namedItem('year').value;
    var url = formvals.namedItem('link').value;
    var publication = formvals.namedItem('publication').value;
    var isSeason = formvals.namedItem('season').value;
    var convertTitle = formvals.namedItem('title_case').checked;
    
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
    var result = validate_date(month_num, day, year);
    var yearstring = result['yearstring'];
    day = result['day'];
    month = result['month'];
    year = result['year'];
    
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    result = validate_publication(publication, true); // make this
    var pubstring = result['pubstring'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
   
    result = validate_url(url);
    url = result['url'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    var titlestring;
    if (convertTitle) {
        titlestring = title_case(title);    
    } else {
        titlestring = title;
    }
    
    if (url.length > 0) {
      titlestring = '<a href="' + url + '"  target="_blank" rel="noopener noreferrer" >' + titlestring + '</a>';
    } else {
      titlestring = titlestring;
    }
    
    result = validate_authors(authors, titlestring); // make this
    autstring = result['autstring'];
    titlestring = result['titlestring'];
    if (titlestring=='') {
        body = title;
    } else {
        body = result['body'];
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
    
    var bib_entry = {};
    bib_entry['text'] = autstring + yearstring + (titlestring.length > 0? '. ':'') + titlestring + (".!?".includes(titlestring[titlestring.length-5])?'':'.') + pubstring;

    bib_entry['body'] = body;
    bib_entry['day'] = day ? day : '';
    bib_entry['month'] = month_num ? month_num : '';
    bib_entry['year'] = year? year : '';
    
    bib_entry['title'] = title;
    bib_entry['link'] = url ? url : '';
    bib_entry['publication'] = publication ? publication : '';
    bib_entry['isSeason'] = isSeason;
    bib_entry['type'] = 'periodical';
    bib_entry['authors'] = authors
    bib_entry['convertTitle'] = convertTitle;
    
    console.log(bib_entry)
    if (!addNonUNDocument(bib_entry))
        return;
    if (document.getElementById("currentlyEditing").value) {
        updateEdit()
    } else {
        update();
    }
    resetAuthors();
    resetSeason();
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
    
    var titlestring = '<a href="' + url + '"  target="_blank" rel="noopener noreferrer" >' + title.trim() + '</a>';
    

    
    
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
    
    var bib_entry = {};
    bib_entry['text'] = titlestring + yearstring + '.';

    bib_entry['body'] = title;
    bib_entry['day'] = 1;
    bib_entry['month'] = 1;
    bib_entry['year'] = year ? year : '';
    
    bib_entry['title'] = title;
    bib_entry['link'] = url ? url : '';
    bib_entry['type'] = 'treaty'
    
    if (!addNonUNDocument(bib_entry))
        return;
    if (document.getElementById("currentlyEditing").value) {
        updateEdit()
    } else {
        update();
    }
    resetAuthors();
    document.getElementById('treaty_form').reset()
}

function other() {
    
    var formvals = document.getElementById('other_form').elements;
    var title = formvals.namedItem('title').value;
    var month_num = formvals.namedItem('month').value; 
    var day = formvals.namedItem('day').value;
    var year = formvals.namedItem('year').value;
    var url = formvals.namedItem('link').value;
    var organization = formvals.namedItem('organization').value;
    var italicize = formvals.namedItem('italicize').checked;
    var convertTitle = formvals.namedItem('title_case').checked;

    
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
    var result = validate_date(month_num, day, year);

    var yearstring = result['yearstring'];
    day = result['day'];
    month = result['month'];
    year = result['year'];
    
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
   
    result = validate_url(url);
    url = result['url'];
    error_msg += result['error_msg'];
    error_level = Math.max(error_level, result['error_level']);
    
    if (convertTitle) {
        titlestring = title_case(title).trim();    
    } else {
        titlestring = title.trim()
    }
    
    if (italicize) {
        titlestring = "<i>" + titlestring + "</i>";
    }
    if (url.length > 0) {
      titlestring = '<a href="' + url + '"  target="_blank" rel="noopener noreferrer" >' + titlestring + '</a>';
    }
    result = validate_authors(authors, organization); // make this
    autstring = result['autstring'];
    body = result['body'];
    organization = result['titlestring'];
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
    
    var bib_entry = {};
    bib_entry['text'] = autstring + yearstring + (titlestring.length > 0? '. ':'') + titlestring + (".!?".includes(titlestring[titlestring.length-5])?'':'.');

    bib_entry['body'] = body;
    bib_entry['day'] = day ? day : '';
    bib_entry['month'] = month_num ? month_num : '';
    bib_entry['year'] = year ? year : '';
    bib_entry['authors'] = authors;
    bib_entry['organization'] = organization;
    bib_entry['type'] = 'other';
    bib_entry['title'] = title;
    bib_entry['link'] = url ? url : '';
    bib_entry['italicize'] = italicize;
    bib_entry['convertTitle'] = convertTitle;
    
    if (!addNonUNDocument(bib_entry))
        return;
    if (document.getElementById("currentlyEditing").value) {
        updateEdit()
    } else {
        update();
    }
    resetAuthors();
    document.getElementById('other_form').reset()
}


/**
 * Takes a list of author names and a document title.
 * If there are two authors, puts them in Author, First and Second Author form
 * If there are more than two authors, puts them in Author, First et al form
 * If there are no authors returns the title
 * In all cases except the last, returns the title without changes
 */
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
    result['body'] = autstring;
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
    var valid_seasons = ['Spring', 'Summer', 'Fall', 'Winter']
    var valid_month = false;
    var valid_day = false;
    
    if (month.length > 0) {
        var month_id = parseInt(month);
        if (isNaN(month)) {
            if (valid_seasons.includes(month)) {
              valid_month = true
              day = ''
            } else {
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
        datestring = day + ((isNaN(day) || day == '')?'':' ') + month + ' ';
    }
    
    if (year.length > 0) {
        var year_id = parseInt(year);
        if (isNaN(year_id) || year_id < 1000 || year_id > 2100) { // should be good for a while
            error_msg += 'Error: Invalid year - ' + year + '.\n';
            error_level = Math.max(error_level, 2);
        } else {
            year = year_id;
            
            yearstring = ' (' + datestring + year + ')';

        }
        
    }
    var result = [];
    result['yearstring'] = yearstring;
    result['year'] = year;
    result['month'] = month_id;
    result['day'] = day_id;
    result['error_msg'] = error_msg;
    result['error_level'] = error_level;
    return result;
    
}

function validate_publication(publication, italicize) {
    var error_msg = '', error_level = 0, pubstring = '';

    if (publication.length > 0) {
        pubstring = ' ' +  (italicize?'<i>':'') + publication + (italicize?'</i>':'') + '.';
    }
    
    
    var result = [];
    result['pubstring'] = pubstring;
    result['error_msg'] = error_msg;
    result['error_level'] = error_level;
    return result;
}

function validate_url(url) { // lol I'm not writing this
    var error_msg = '';
    var error_level = 0;

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
    var del = row.insertCell(2);    
    label.innerHTML = 'Author ' + author_p + ':';
    input.innerHTML = "<input type='text' name='firstname" + author_p + "' placeholder='First'> <input type='text' name='lastname" + author_p + "' placeholder='Last'>";
    del.innerHTML = "<input type='button' value='Remove' onclick=removeAuthorP("+(author_o-1)+")>"
}

function addAuthorO() {
    var table = document.getElementById('other_table');
    var row = table.insertRow(author_o++);
    var label = row.insertCell(0);
    var input = row.insertCell(1);
    var del = row.insertCell(2);
    label.innerHTML = 'Author ' + author_o + ':';
    input.innerHTML = "<input type='text' name='firstname" + author_o + "' placeholder='First'> <input type='text' name='lastname" + author_o + "' placeholder='Last'>";
    del.innerHTML = "<input type='button' value='Remove' onclick=removeAuthorO("+(author_o-1)+")>"
}
function removeAuthorP(i) {
  var table = document.getElementById('periodical_table');
  table.deleteRow(i);
  author_o--;
  for (var j=i;j<author_p;j++) {
    table.rows[j].cells[0].innerHTML = 'Author ' + (j+1) + ':';
    table.rows[j].cells[1].children[0].name = 'firstname' + (j+1);
    table.rows[j].cells[1].children[1].name = 'lastname' + (j+1);
    table.rows[j].cells[2].innerHTML = "<input type='button' value='Remove' onclick=removeAuthorP("+j+")>"
  }
}
function removeAuthorO(i) {
  var table = document.getElementById('other_table');
  table.deleteRow(i);
  author_o--;
  for (var j=i;j<author_o;j++) {
    table.rows[j].cells[0].innerHTML = 'Author ' + (j+1) + ':';
    table.rows[j].cells[1].children[0].name = 'firstname' + (j+1);
    table.rows[j].cells[1].children[1].name = 'lastname' + (j+1);
    table.rows[j].cells[2].innerHTML = "<input type='button' value='Remove' onclick=removeAuthorO("+j+")>"
  }
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
    if (one['body'].toLowerCase() < other['body'].toLowerCase()) {
            return true;
    } else if (one['body'].toLowerCase() === other['body'].toLowerCase()) {
        if (one['year'] > other['year']) {
            return true;
        } else if (one['year'] === other['year']) {
            if (one['month'] > other['month']) {
                return true;
            } else if (one['month'] === other['month']) {
                if (one['day'] > other['day']) {
                    return true;
                } else if (one['day'] > other['day']) {
                    if (one['text'].toLowerCase() < other['text'].toLowerCase()) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}



function addUNDocument(bib_entry) {
    console.log(bib_entry)
    var i = -1;
    var alerted = false;
    for (var j=0; j<un_documents.length; j++) {
        if (i<0 && lessthan(bib_entry, un_documents[j])) {
            i=j;
        }
        // alert(un_documents[j]["link"] + "\n---\n" + bib_entry["link"])
        if (bib_entry["link"] && un_documents[j]["link"] === bib_entry["link"] && !alerted) {
            intended = confirm("Duplicate link with " + un_documents[j]["title"] + " (" + un_documents[j]["year"] +"); was this intended?");
            alerted=true;
            if (!intended) {
                return false;
            }

        }
    }
    un_documents.splice(i, 0, bib_entry);
    console.log(un_documents[i])
    return true;
}

function addNonUNDocument(bib_entry) {
    console.log(bib_entry)
    var i = -1;
    var alerted = false;
    for (var j=0; j<other_documents.length; j++) {
        if (i<0 && lessthan(bib_entry, other_documents[j])) {
            i=j;
        }
        // alert(un_documents[j]["link"] + "\n---\n" + bib_entry["link"])
        if (bib_entry["link"] && other_documents[j]["link"] === bib_entry["link"] && !alerted) {
            intended = confirm("Duplicate link with " + other_documents[j]["title"] + "; was this intended?");
            alerted=true;
            if (!intended) {
                return false;
            }

        }
    }

    other_documents.splice(i, 0, bib_entry);
    return true;
}

function addMonthDay() {
  
  
}

function autoLink() {
    var id_field = document.getElementById('un_docid');
    var link_field = document.getElementById('un_link');
    if (link_field.value.length == 0 || confirm("Overwrite link?")) {
            link_field.value = "https://undocs.org/en/" + id_field.value;
    } 
    
}


function autoID() {
    var id_field = document.getElementById('un_docid');
    var link_field = document.getElementById('un_link');
    if (/undocs.org\//.test(link_field.value)) {
        if (id_field.value.length == 0 || confirm("Overwrite document ID?")) {
            id_field.value = link_field.value.match(/undocs.org\/(?:en\/)?(.*)/)[1];
        }
    } else {
        alert("Unable to read document ID from URL. Please use a undocs.org URL.");
    }
    
}

var stop_words = 'a an the for and nor but or yet so as if above across after at around before behind below beside between by down during for from in inside onto of off on out through to under up with'.split(' ');
var cap_words = 'UN ECOSOC US USA EU GA';
function title_case(text) {
    var words = text.split(' ');
    if (words.length == 0) {
        return text;
    }
    // words[0] = capitalize(words[0]);
    isAllCaps = (text === text.toUpperCase())
    for (var i=0;i<words.length;i++) {
        if (i>0 && stop_words.includes(words[i].toLowerCase())) {
            words[i] = words[i].toLowerCase();
        } else if (cap_words.includes(words[i].toUpperCase())) {
            words[i] = words[i].toUpperCase();
        } else if (words[i] === words[i].toUpperCase() && !isAllCaps) {
            // if the title is not in all caps and a word *is* in all caps, keep it allcapsed
            words[i] = words[i]
        } else if ((words[i].match(/[^a-zA-Z]/g)) == null) {
            // if there are any nonalphabetic characters, leave it alone
            words[i] = capitalize(words[i]);
        }
    }
    return words.join(' ')
}

function capitalize(word) {
    if (word.length > 0) {
        word = word[0].toUpperCase() + word.slice(1).toLowerCase();
    }
    return word
}

function switchSeasonP() {
  formvals = document.getElementById("periodical_form").elements
  formvals.namedItem("day").type = "hidden";
  formvals.namedItem("month").size=6;
  formvals.namedItem("month").maxLength=6;
  formvals.namedItem("month").placeholder="Season";
  formvals.namedItem("season").value=true;
  formvals.namedItem("switch").value="Use date instead of season";
  formvals.namedItem("switch").onclick=resetSeason;
}

function resetSeason() {
  formvals = document.getElementById("periodical_form").elements
  formvals.namedItem("day").type = "text";
  formvals.namedItem("month").size=2;
  formvals.namedItem("month").maxLength=2;
  formvals.namedItem("month").placeholder="MM";
  formvals.namedItem("season").value=false;
  formvals.namedItem("switch").value="Use season instead of date";  
  formvals.namedItem("switch").onclick=switchSeasonP;
}

function edit() {
  document.getElementById("editbutton").value='Switch to view mode';
  document.getElementById("editbutton").onclick=unedit;
  document.getElementById("currentlyEditing").value="true";
  updateEdit();
}

function updateEdit() {
  var bibTable = document.createElement("TABLE");
  document.getElementById('output').innerHTML = '<b><u>Bibliography</u></b><br><br>';  
  
  for (var i=0; i < other_documents.length; i++) {
      row = bibTable.insertRow(-1);
      td = row.insertCell(0);
      td.innerHTML="<input type='button', value='Delete', onclick='deleteOther("+i+")'>";
      td = row.insertCell(1);
      td.innerHTML="<input type='button', value='Edit', onclick='editOther("+i+")'>"
      td = row.insertCell(2);
      td.innerHTML="<input type='button', value='Copy', onclick='copyOther("+i+")'>"
      td = row.insertCell(3);
      td.innerHTML=other_documents[i]['text']
  }
  document.getElementById('output').appendChild(bibTable)
  document.getElementById('output').innerHTML += '<b>United Nations Documents:</b><br><br>';
  bibTable = document.createElement("TABLE");
  for (var i=0; i<un_documents.length; i++) {
      row = bibTable.insertRow(-1);
      td = row.insertCell(0);
      td.innerHTML="<input type='button', value='Delete', onclick='deleteUN("+i+")'>";
      td = row.insertCell(1);
      td.innerHTML="<input type='button', value='Edit', onclick='editUN("+i+")'>"
      td = row.insertCell(2);
      td.innerHTML="<input type='button', value='Copy', onclick='copyUN("+i+")'>"
      td = row.insertCell(3);      
      td.innerHTML=un_documents[i]['text']
  }
  document.getElementById('output').appendChild(bibTable)
  
}

function deleteOther(i) {
  other_documents.splice(i,1);
  updateEdit();
}
function deleteUN(i) {
  un_documents.splice(i,1);
  updateEdit();
}

function editOther(i) {
  console.info("Editing " + i);
  loadDoc(other_documents.splice(i,1)[0]);
  updateEdit();
}
function editUN(i) {
  console.info('Called editUN('+i)
  loadDoc(un_documents.splice(i,1)[0]);
  updateEdit();
}

function copyOther(i) {
  console.info("Copying " + i);
  loadDoc(other_documents[i]);
  updateEdit();
}
function copyUN(i) {
  console.info('Called copyUN('+i)
  loadDoc(un_documents[i]);
  updateEdit();
}


function loadDoc(doc) {
  console.info("Loading " + JSON.stringify(doc));
  var dropdown = document.getElementById('bibtype');
  
  console.info("Type " + doc.type);
  if (doc['type'] == 'un') {
    dropdown.selectedIndex = 0;
    selectDocType();
    formvals = document.getElementById('undoc_form').elements;
    if (doc['body']) {
        formvals.namedItem("body").value = doc['body'];
    } else {
        formvals.namedItem("body").value = '';
    }
    if (doc['title']) {
        formvals.namedItem("title").value = doc['title'];
    }
    else{
        formvals.namedItem("title").value = '';
    }
    if (doc['year']){
        formvals.namedItem("year").value = doc['year'];
    }
    else {
        formvals.namedItem("year").value = '';
    }
    if (doc['doc_number']) {
        formvals.namedItem("docid").value = doc['doc_number'];
    }
    else {
        formvals.namedItem("docid").value = '';
    }
    if (doc['link']) {
        formvals.namedItem("link").value = doc['link'];
    }
    else
        formvals.namedItem("link").value = '';
    // formvals.namedItem("title").value = doc['title'];
    // formvals.namedItem("year").value = doc['year'];
    // formvals.namedItem("docid").value = doc['doc_number'];
    // formvals.namedItem("link").value = doc['url'];
  } else if (doc['type'] == 'periodical') {
    dropdown.selectedIndex = 1;
    selectDocType();
    formvals = document.getElementById('periodical_form').elements;

    if (doc["isSeason"] && ! formvals.namedItem("season")) {
      switchSeasonP();
    } else if (!doc["isSeason"] && formvals.namedItem("season")) {
      resetSeason();
    }
    
    for (var i=1;i<=doc["authors"].length;i++) {
        if (i>1) {
            addAuthorP();
        }
        formvals.namedItem('firstname'+ i).value = doc["authors"][i-1][0];
        formvals.namedItem('lastname'+i).value = doc["authors"][i-1][1];
    }
    

    formvals.namedItem("title").value = doc['title'];
    formvals.namedItem("month").value = doc['month'];
    formvals.namedItem("day").value = doc['day'];
    formvals.namedItem("year").value = doc['year'];
    formvals.namedItem("link").value = doc['link'];
    formvals.namedItem("publication").value = doc['publication'];
    formvals.namedItem("title_case").checked = doc['convertTitle'];
  } else if (doc['type'] == 'treaty') {
    dropdown.selectedIndex = 2;
    selectDocType();
    formvals = document.getElementById('treaty_form').elements;
    formvals.namedItem("title").value = doc['title'];
    formvals.namedItem("year").value = doc['year'];
    formvals.namedItem("link").value = doc['link'];
  } else if (doc['type'] == 'other') {
    dropdown.selectedIndex = 3;
    selectDocType();
    formvals = document.getElementById('other_form').elements;
    
    for (var i=1;i<=doc["authors"].length;i++) {
        if (i>1) {
            addAuthorO();
        }
        console.log("Loading author " + (i-1));
        formvals.namedItem('firstname'+ i).value = doc["authors"][i-1][0];
        formvals.namedItem('lastname'+i).value = doc["authors"][i-1][1];
    }
    
    formvals.namedItem("organization").value = doc['organization'];
    formvals.namedItem("title").value = doc['title'];
    formvals.namedItem("month").value = doc['month'];
    formvals.namedItem("day").value = doc['day'];
    formvals.namedItem("year").value = doc['year'];
    formvals.namedItem("link").value = doc['link'];
    formvals.namedItem("italicize").checked = doc['italicize'];
    formvals.namedItem("title_case").checked = doc['convertTitle'];
  } else {
    console.error("Error: unrecognized type " + doc['type']);
  }
  
}


function unedit() {
  document.getElementById("editbutton").value='Switch to edit mode';
  document.getElementById("editbutton").onclick=edit;
  document.getElementById("currentlyEditing").value="";
  update()
}

function update() {
    if (document.getElementById('currentlyEditing')=="true"){
      updateEdit();
    } else {
      var bibtext = '<b><u>Bibliography</b></u><br><br>'
      for (var i=0; i < other_documents.length; i++) {
          bibtext += other_documents[i]['text'] + '<br><br>';
      }
      bibtext += '<b>United Nations Documents:</b><br><br>';
      for (var i=0; i<un_documents.length; i++) {
          bibtext += un_documents[i]['text'] + '<br><br>';
      }
      document.getElementById('output').innerHTML = bibtext;
    }
}