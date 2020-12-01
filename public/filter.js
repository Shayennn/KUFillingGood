var filter = {
    SubName: false,
    SubCode: false,
    Teacher: false,
    DepCode: false,
    SecType: false,
    GenFilter: true,
    GenType: false,
    Credit: false,
    DepSpecific: false,
};

function loadFilter() {
    filter = Sess["filter"];
    if (filter["SubName"] === false)
        document.getElementById("txtSubName").value = "";
    else document.getElementById("txtSubName").value = filter["SubName"];

    if (filter["Teacher"] === false)
        document.getElementById("txtTeacher").value = "";
    else document.getElementById("txtTeacher").value = filter["Teacher"];

    if (filter["SubCode"] === false)
        document.getElementById("txtSubCode").value = "";
    else document.getElementById("txtSubCode").value = filter["SubCode"];

    if (filter["DepCode"] === false)
        document.getElementById("txtDepCode").value = "";
    else document.getElementById("txtDepCode").value = filter["DepCode"];

    document.getElementById("chkDepSpe").checked = filter["DepSpecific"];
    document.getElementById("chkGenFilter").checked = filter["GenFilter"];

    if (filter["GenType"] === false)
        document.getElementById("optGenType").value = "";
    else document.getElementById("optGenType").value = filter["GenType"];

    if (filter["Credit"] === false)
        document.getElementById("txtCredit").value = "";
    else document.getElementById("txtCredit").value = filter["Credit"];

    if (filter["SecType"] === false)
        document.getElementById("optSecTypeAll").checked = true;
    if (filter["SecType"] === "Lab")
        document.getElementById("optSecTypeLab").checked = true;
    if (filter["SecType"] === "Lecture")
        document.getElementById("optSecTypeLec").checked = true;
}

function parseFilter() {
    filter["SubName"] = document.getElementById("txtSubName").value;
    if (filter["SubName"] == "") filter["SubName"] = false;

    filter["Teacher"] = document.getElementById("txtTeacher").value;
    if (filter["Teacher"] == "") filter["Teacher"] = false;

    filter["DepCode"] = document.getElementById("txtDepCode").value;
    if (filter["DepCode"] == "") filter["DepCode"] = false;

    filter["SubCode"] = document.getElementById("txtSubCode").value;
    if (filter["SubCode"] == "") filter["SubCode"] = false;

    var SecType_Lec = document.getElementById("optSecTypeLec").checked;
    var SecType_Lab = document.getElementById("optSecTypeLab").checked;
    if (SecType_Lec) filter["SecType"] = "Lecture";
    else if (SecType_Lab) filter["SecType"] = "Lab";
    else filter["SecType"] = false;

    var GenFilter = document.getElementById("chkGenFilter").checked;
    filter["GenFilter"] = GenFilter;

    var DepSpecific = document.getElementById("chkDepSpe").checked;
    filter["DepSpecific"] = DepSpecific;

    filter["GenType"] = document.getElementById("optGenType").value;
    if (filter["GenType"] == "") filter["GenType"] = false;

    filter["Credit"] = document.getElementById("txtCredit").value;
    if (filter["Credit"] == "") filter["Credit"] = false;
}

function updateFilter() {
    $("#filterbox").collapse("hide");
    Sess["canAdd"] = [];
    parseFilter();
    loadBuu()
        .then(loadSubject)
        .then(() => {
            Sess["filter"] = filter;
            saveSession();
        })
        .then(renderPage);
}
