var templateSubjectCard = '';

const joinhead = '<p class="card-text mb-0">'
const joinend = '</p>'
const jointxt = joinend + joinhead

function renderSubjectCard(sub, id) {
    var thisCard = templateSubjectCard;
    var SecColor = 'primary';
    if (sub.sectionTypeEn == 'Lab') SecColor = 'secondary';
    var timeTxt = 'ติดต่อผู้สอน'
    if (sub.coursedate !== null)
        timeTxt = joinhead + sub.coursedate.split(',').join(jointxt) + joinend
    if (sub.hasOwnProperty('type')) {
        thisCard = thisCard.replace('{{BuuType}}', sub.type);
        if (sub.subtype !== null)
            thisCard = thisCard.replace('{{BuuSubtype}}', sub.subtype);
        else
            thisCard = thisCard.replace('{{BuuSubtype}}', '');
    } else {
        thisCard = thisCard.replace('{{BuuType}}', '');
        thisCard = thisCard.replace('{{BuuSubtype}}', '');
    }
    if(sub.roomNameTh === null)sub.roomNameTh = 'ติดต่อผู้สอน'
    if(sub.teacherName === null)sub.teacherName = 'ติดต่อหน่วยทะเบียน'
    if(sub.property === null)sub.property = 'ติดต่อผู้สอน'
    if(sub.nonProperty === null)sub.nonProperty = 'ติดต่อผู้สอน'
    if(sub.midternDate === null)sub.midternDate = 'ติดต่อผู้สอน'
    if(sub.finalDate === null)sub.finalDate = 'ติดต่อผู้สอน'
    thisCard = thisCard.replace('{{id}}', id);
    thisCard = thisCard.replace('{{id}}', id);
    thisCard = thisCard.replace('{{Code}}', sub.subjectCode);
    thisCard = thisCard.replace('{{Section}}', sub.sectionCode);
    thisCard = thisCard.replace('{{SecColor}}', SecColor);
    thisCard = thisCard.replace('{{SecType}}', sub.sectionTypeTh);
    thisCard = thisCard.replace('{{Credit}}', sub.maxCredit);
    thisCard = thisCard.replace('{{THName}}', sub.subjectNameTh);
    thisCard = thisCard.replace('{{ENName}}', sub.subjectNameEn);
    thisCard = thisCard.replace('{{Time}}', timeTxt);
    thisCard = thisCard.replace('{{Place}}', sub.roomNameTh);
    thisCard = thisCard.replace('{{TotalSeat}}', sub.totalSeat);
    thisCard = thisCard.replace('{{Teacher}}', sub.teacherName);
    thisCard = thisCard.replace('{{Allow}}', sub.property);
    thisCard = thisCard.replace('{{NotAllow}}', sub.nonProperty);
    thisCard = thisCard.replace('{{Midterm}}', sub.midternDate);
    thisCard = thisCard.replace('{{Final}}', sub.finalDate);
    return thisCard;
}

async function addCard(sub, id) {
    var cardtxt = renderSubjectCard(sub, id)
    document.getElementById('resultList').innerHTML += cardtxt
    return;
}

function createCSV(){
    const items = Sess['canAdd']
    const replacer = (key, value) => value === null ? '' : value // specify how you want to handle null values here
    const header = Object.keys(items[0])
    let csv = items.map(row => header.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','))
    csv.unshift(header.join(','))
    csv = csv.join('\r\n')
    return csv
}

async function renderPage() {
    if (sessionStorage.getItem('theSession') === null) {
        document.getElementById('resultList').innerHTML = '<h2 class="text-center mt-5 pt-5">กลับไปกรอกข้อมูลวิชาก่อนนะ ^^</h2>'
        return;
    }
    document.getElementById('resultList').innerHTML = '<h2 class="text-center mt-5 pt-5">Loading...</h2>'
    sessionFetcher()
    loadFilter()
    await loadSubjectCard();
    if (Sess['canAdd'].length == 0)
        findAllCanReg(
            filter['GenFilter'],
            filter['Credit'],
            filter['DepCode'],
            filter['SecType'],
            filter['GenType'],
            filter['DepSpecific']
        )
    console.log(Sess['canAdd'].length, 'Sorting')
    Sess['canAdd'] = Sess['canAdd'].sort((a, b) => {
        return parseInt(a.subjectCode.slice(0, 8)) * 1000 + parseInt(a.sectionCode) - parseInt(b.subjectCode.slice(0, 8)) * 1000 + parseInt(b.sectionCode)
    })
    console.log(Sess['canAdd'].length, 'Showing')

    var download = '';
    if (Sess['canAdd'].length == 0)
        document.getElementById('resultList').innerHTML = '<h2 class="text-center mt-5 pt-5">ว้าาา เสียใจด้วยนะ ไม่เจอเลยสักตัว</h2>'
    else if (Sess['canAdd'].length > 300) {
        document.getElementById('resultList').innerHTML = '<p class="text-muted text-right mt-3"> กำลังแสดง 50 หมู่เรียนแรก จากทั้งหมด ' + Sess['canAdd'].length + ' หมู่เรียน</p>'
        Sess['canAdd'].slice(0, 50).forEach(addCard)
    } else {
        document.getElementById('resultList').innerHTML = '<p class="text-muted text-right mt-3">กำลังแสดงทั้งหมด ' + Sess['canAdd'].length + ' หมู่เรียน</p>'
        Sess['canAdd'].forEach(addCard)
    }
    const blob = new Blob([createCSV()], {type : 'text/csv'});
    const blobUrl = URL.createObjectURL(blob);
    document.getElementById('downloadBtn').classList.remove('disabled')
    document.getElementById('downloadBtn').href = blobUrl;
    document.getElementById('downloadBtn').download = 'KUFillingGood.csv';
}

document.addEventListener("DOMContentLoaded", renderPage);