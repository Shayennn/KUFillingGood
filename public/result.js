var templateSubjectCard = "";

function subjectAddBtn(btn) {
    addSubjectToMyList(Sess["canAdd"][parseInt(btn.id)]);
    renderPage();
}

function subjectRemoveBtn(btn) {
    console.log(Sess["FixedSubjectInfo"][btn.target.getAttribute("subindex")]);
    removeSubjectFromMyList(
        Sess["FixedSubjectInfo"][btn.target.getAttribute("subindex")]
    );
    renderPage();
}

function addSubjectToMyList(sub) {
    initStorage();
    Sess["FixedSubject"].push(sub.subjectCode + ":" + sub.sectionCode);
    Sess["FixedSubjectInfo"].push(sub);
    Sess["currentCredit"] += sub.maxCredit;
    str2timearr(sub.coursedate).forEach((val) => {
        addsubject2timetable(
            val[0],
            val[1],
            val[2],
            sub.subjectCode +
                ":" +
                sub.sectionCode +
                " - " +
                sub.subjectNameEn +
                " (" +
                sub.sectionTypeEn +
                ")"
        );
    });
    saveSession();
    storageEngine.setItem("subjectList", JSON.stringify(Sess["FixedSubject"]));
}

function removeSubjectFromMyList(sub) {
    initStorage();
    Sess["FixedSubject"].splice(
        Sess["FixedSubject"].indexOf(sub.subjectCode + ":" + sub.sectionCode),
        1
    );
    Sess["FixedSubjectInfo"].splice(Sess["FixedSubjectInfo"].indexOf(sub), 1);
    Sess["currentCredit"] -= sub.maxCredit;
    Sess["timetable"] = [[], [], [], [], [], [], []];
    Sess["FixedSubjectInfo"].forEach((sub) => {
        str2timearr(sub.coursedate).forEach((val) => {
            addsubject2timetable(
                val[0],
                val[1],
                val[2],
                sub.subjectCode +
                    ":" +
                    sub.sectionCode +
                    " - " +
                    sub.subjectNameEn +
                    " (" +
                    sub.sectionTypeEn +
                    ")"
            );
        });
    });
    saveSession();
    storageEngine.setItem("subjectList", JSON.stringify(Sess["FixedSubject"]));
}

const joinhead = '<p class="card-text mb-0">';
const joinend = "</p>";
const jointxt = joinend + joinhead;

function renderSubjectCard(sub, id) {
    var thisCard = templateSubjectCard;
    var SecColor = "primary";
    if (sub.sectionTypeEn == "Lab") SecColor = "secondary";
    var timeTxt = "ติดต่อผู้สอน";
    if (sub.coursedate !== null)
        timeTxt = joinhead + sub.coursedate.split(",").join(jointxt) + joinend;
    if (sub.hasOwnProperty("type")) {
        thisCard = thisCard.replace("{{BuuType}}", sub.type);
        if (sub.subtype !== null)
            thisCard = thisCard.replace("{{BuuSubtype}}", sub.subtype);
        else thisCard = thisCard.replace("{{BuuSubtype}}", "");
    } else {
        thisCard = thisCard.replace("{{BuuType}}", "");
        thisCard = thisCard.replace("{{BuuSubtype}}", "");
    }
    if (sub.roomNameTh === null) sub.roomNameTh = "ติดต่อผู้สอน";
    if (sub.teacherName === null) sub.teacherName = "ติดต่อหน่วยทะเบียน";
    if (sub.property === null) sub.property = "ติดต่อผู้สอน";
    if (sub.nonProperty === null) sub.nonProperty = "ติดต่อผู้สอน";
    if (sub.midternDate === null) sub.midternDate = "ติดต่อผู้สอน";
    if (sub.finalDate === null) sub.finalDate = "ติดต่อผู้สอน";
    thisCard = thisCard.replace("{{id}}", id);
    thisCard = thisCard.replace("{{id}}", id);
    thisCard = thisCard.replace("{{id}}", id);
    thisCard = thisCard.replace("{{id}}", id);
    thisCard = thisCard.replace("{{Code}}", sub.subjectCode);
    thisCard = thisCard.replace("{{Section}}", sub.sectionCode);
    thisCard = thisCard.replace("{{SecColor}}", SecColor);
    thisCard = thisCard.replace("{{SecType}}", sub.sectionTypeTh);
    thisCard = thisCard.replace("{{Credit}}", sub.maxCredit);
    thisCard = thisCard.replace("{{THName}}", sub.subjectNameTh);
    thisCard = thisCard.replace("{{ENName}}", sub.subjectNameEn);
    thisCard = thisCard.replace("{{Time}}", timeTxt);
    thisCard = thisCard.replace("{{Place}}", sub.roomNameTh);
    let color = "primary";
    if (sub.totalRegistered >= 0.8 * sub.totalSeat) color = "warning";
    if (sub.totalRegistered == sub.totalSeat) color = "danger";
    thisCard = thisCard.replace("{{CardColor}}", color);
    thisCard = thisCard.replace("{{TotalRegistered}}", sub.totalRegistered);
    thisCard = thisCard.replace("{{TotalSeat}}", sub.totalSeat);
    thisCard = thisCard.replace("{{Teacher}}", sub.teacherName);
    thisCard = thisCard.replace("{{Allow}}", sub.property);
    thisCard = thisCard.replace("{{NotAllow}}", sub.nonProperty);
    thisCard = thisCard.replace("{{Midterm}}", sub.midternDate);
    thisCard = thisCard.replace("{{Final}}", sub.finalDate);
    return thisCard;
}

async function addCard(sub, id) {
    var cardtxt = renderSubjectCard(sub, id);
    document.getElementById("resultList").innerHTML += cardtxt;
    if (sub.hasOwnProperty("type")) {
        document.getElementById("rev_" + id).href =
            "https://www.kuclap.com/" + sub.subjectCode.slice(0, 8);
    } else {
        document.getElementById("rev_" + id).remove();
    }
    return;
}

function createCSV() {
    const items = Sess["canAdd"];
    const replacer = (key, value) => (value === null ? "" : value); // specify how you want to handle null values here
    const header = Object.keys(items[0]);
    let csv = items.map((row) =>
        header
            .map((fieldName) => JSON.stringify(row[fieldName], replacer))
            .join(",")
    );
    csv.unshift(header.join(","));
    csv = csv.join("\r\n");
    return csv;
}

function prepareDownload() {
    const blob = new Blob([createCSV()], {
        type: "text/csv",
    });
    const blobUrl = URL.createObjectURL(blob);
    document.getElementById("downloadBtn").classList.remove("disabled");
    document.getElementById("downloadBtn").href = blobUrl;
    document.getElementById("downloadBtn").download = "KUFillingGood.csv";
}

function renderModal() {
    document.getElementById("currentCredit").innerText = Sess["currentCredit"];
    const tb = document.getElementById("sublist");
    tb.innerHTML = "";
    // var FixedSubjectInfo = [...Sess["FixedSubjectInfo"]];
    var FixedSubjectInfo = Sess["FixedSubjectInfo"].sort((a, b) => {
        return (
            parseInt(a.subjectCode.slice(0, 8)) * 1000 +
            parseInt(a.sectionCode) -
            parseInt(b.subjectCode.slice(0, 8)) * 1000 +
            parseInt(b.sectionCode)
        );
    });
    FixedSubjectInfo.forEach((sub) => {
        if (sub.roomNameTh === null) sub.roomNameTh = "ติดต่อผู้สอน";
        if (sub.teacherName === null) sub.teacherName = "ติดต่อหน่วยทะเบียน";
        if (sub.property === null) sub.property = "ติดต่อผู้สอน";
        if (sub.nonProperty === null) sub.nonProperty = "ติดต่อผู้สอน";
        if (sub.midternDate === null) sub.midternDate = "ติดต่อผู้สอน";
        if (sub.finalDate === null) sub.finalDate = "ติดต่อผู้สอน";
        if (sub.coursedate === null) sub.coursedate = "ติดต่อผู้สอน";
        var tr = tb.appendChild(document.createElement("tr"));
        var action_col = tr.appendChild(document.createElement("td"));
        var delbtn = action_col.appendChild(document.createElement("button"));
        delbtn.textContent = "นำออก";
        delbtn.classList.add("btn");
        delbtn.classList.add("btn-danger");
        delbtn.setAttribute("subindex", Sess["FixedSubjectInfo"].indexOf(sub));
        delbtn.onclick = subjectRemoveBtn;
        var code = tr.appendChild(document.createElement("th"));
        code.innerHTML = sub.subjectCode;
        code.innerHTML += "<br>";
        code.innerHTML += "Sec: " + sub.sectionCode;
        if (sub.totalRegistered == sub.totalSeat) {
            code.innerHTML += "<br>";
            code.innerHTML +=
                '<span class="badge badge-pill badge-danger">ที่นั่งเต็ม</span>';
        }
        var info = tr.appendChild(document.createElement("td"));
        info.innerHTML = sub.subjectNameTh;
        info.innerHTML += "<br>";
        info.innerHTML += sub.subjectNameEn;
        info.innerHTML += "<br>";
        info.innerHTML += "Credit: " + sub.maxCredit;
        info.innerHTML += " Seat: " + sub.totalSeat;
        info.innerHTML += "<br>";
        info.innerHTML += sub.coursedate.split(",").join("<br>");
        info.innerHTML = "<small>" + info.innerHTML + "</small>";
        var teacher = tr.appendChild(document.createElement("td"));
        teacher.innerHTML = sub.teacherName.split(",").join(", ");
        var roomName = tr.appendChild(document.createElement("td"));
        roomName.innerHTML = sub.roomNameTh;
    });
}

async function renderPage() {
    initStorage();
    if (storageEngine.getItem("theSession") === null) {
        document.getElementById("resultList").innerHTML =
            '<h2 class="text-center mt-5 pt-5">กลับไปกรอกข้อมูลวิชาก่อนนะ ^^</h2>';
        return;
    }
    document.getElementById("resultList").innerHTML =
        '<h2 class="text-center mt-5 pt-5">Loading...</h2>';
    sessionFetcher();
    loadFilter();
    await loadSubject();
    await loadSubjectCard();
    if (Sess["canAdd"].length == 0)
        findAllCanReg(
            filter["GenFilter"],
            filter["Credit"],
            filter["DepCode"],
            filter["SecType"],
            filter["GenType"],
            filter["DepSpecific"],
            filter["SubCode"],
            filter["Teacher"],
            filter["SubName"]
        );
    console.log(Sess["canAdd"].length, "Sorting");
    Sess["canAdd"] = Sess["canAdd"].sort((a, b) => {
        return (
            parseInt(a.subjectCode.slice(0, 8)) * 1000 +
            parseInt(a.sectionCode) -
            parseInt(b.subjectCode.slice(0, 8)) * 1000 +
            parseInt(b.sectionCode)
        );
    });
    console.log(Sess["canAdd"].length, "Showing");

    var download = "";
    if (Sess["canAdd"].length == 0) {
        document.getElementById("resultList").innerHTML =
            '<h2 class="text-center mt-5 pt-5">ว้าาา เสียใจด้วยนะ ไม่เจอที่ลงได้เลยสักตัว</h2>';
        document.getElementById("downloadBtn").classList.add("disabled");
    } else if (Sess["canAdd"].length > 200) {
        document.getElementById("resultList").innerHTML =
            '<p class="text-muted text-right mt-3"> กำลังแสดง 200 หมู่เรียนแรก จากทั้งหมด ' +
            Sess["canAdd"].length +
            " หมู่เรียน</p>";
        Sess["canAdd"].slice(0, 200).forEach(addCard);
        prepareDownload();
    } else {
        document.getElementById("resultList").innerHTML =
            '<p class="text-muted text-right mt-3">กำลังแสดงทั้งหมด ' +
            Sess["canAdd"].length +
            " หมู่เรียน</p>";
        Sess["canAdd"].forEach(addCard);
        prepareDownload();
    }
    renderModal();
    drawTimetable();
    // $('#myList').modal('show')
}

document.addEventListener("DOMContentLoaded", renderPage);
