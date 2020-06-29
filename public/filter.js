var filter = {
    DepCode: false,
    SecType: false,
    GenFilter: true,
    GenType: false,
    Credit: false,
    DepSpecific: false
}

function loadFilter() {
    filter = Sess['filter']
    if (filter['DepCode'] === false) document.getElementById('txtDepCode').value = ''
    else document.getElementById('txtDepCode').value = filter['DepCode']

    document.getElementById('chkDepSpe').checked = filter['DepSpecific']
    document.getElementById('chkGenFilter').checked = filter['GenFilter']

    if (filter['GenType'] === false) document.getElementById('optGenType').value = ''
    else document.getElementById('optGenType').value = filter['GenType']

    if (filter['Credit'] === false) document.getElementById('txtCredit').value = ''
    else document.getElementById('txtCredit').value = filter['Credit']

    if (filter['SecType'] === false) document.getElementById('optSecTypeAll').checked = true
    if (filter['SecType'] === 'Lab') document.getElementById('optSecTypeLab').checked = true
    if (filter['SecType'] === 'Lecture') document.getElementById('optSecTypeLec').checked = true
}

function parseFilter() {
    filter['DepCode'] = document.getElementById('txtDepCode').value
    if (filter['DepCode'] == '') filter['DepCode'] = false

    var SecType_Lec = document.getElementById('optSecTypeLec').checked
    var SecType_Lab = document.getElementById('optSecTypeLab').checked
    if (SecType_Lec) filter['SecType'] = 'Lecture'
    else if (SecType_Lab) filter['SecType'] = 'Lab'
    else filter['SecType'] = false

    var GenFilter = document.getElementById('chkGenFilter').checked
    filter['GenFilter'] = GenFilter

    var DepSpecific = document.getElementById('chkDepSpe').checked
    filter['DepSpecific'] = DepSpecific

    filter['GenType'] = document.getElementById('optGenType').value
    if (filter['GenType'] == '') filter['GenType'] = false

    filter['Credit'] = document.getElementById('txtCredit').value
    if (filter['Credit'] == '') filter['Credit'] = false
}

function updateFilter() {
    $('#filterbox').collapse('hide')
    Sess['canAdd'] = []
    parseFilter()
    loadBuu()
        .then(loadSubject)
        .then(() => {
            Sess['filter'] = filter
            saveSession()
        })
        .then(renderPage);
}