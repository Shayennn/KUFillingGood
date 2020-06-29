var Sess = {
    subjectData: [],
    BuuData: [],
    FixedSubject: [],
    FixedSubjectInfo: [],
    timetable: [
        [],
        [],
        [],
        [],
        [],
        [],
        []
    ],
    canAdd: [],
    creditLimit: 22,
    currentCredit: 0,
    filter: {
        DepCode: false,
        SecType: false,
        GenFilter: true,
        GenType: false,
        Credit: false,
        DepSpecific: false
    }
};

/**
 * StdType 1 = Normal, 2 = Extra, 3 = Inter
 * **/
var stdType = 1;

const DEBUG = false;
if (DEBUG) {
    var textbox = document.getElementById('subject_section');
    if (textbox !== null)
        textbox.value = "01204213:1\n01204324:11\n01204325:1\n01204332:1\n01204341:1\n01204341:11\n01205386:12\n01208201:1\n01176141:1\n01162111:1";
    // textbox.value = "01204213:1\n01204324:11\n01204325:1\n01204332:1\n01204341:1\n01204341:11\n01205386:12\n";
    // parseSubject();
    // loadBuu();
    // loadSubject().then(findSubjectData).then(() => {
    //     console.log(Sess['FixedSubjectInfo'])
    // }).then(() => {
    //     findAllCanReg()
    // });
    // findSubjectData();
}

function renderMain(){
    var ss = document.getElementById('subject_section')
    var sess_sub = sessionStorage.getItem('subjectList')
    if(sess_sub !== null && ss !== null){
        ss.value = JSON.parse(sess_sub).join("\n")
    }
}

document.addEventListener("DOMContentLoaded", renderMain);

function btnAction() {
    var btn = document.getElementById('thebtn')
    btn.classList.add('disabled')
    btn.setAttribute('disabled', 'disabled')
    btn.innerText = 'กำลังตรวจสอบ'
    parseSubject();
    loadBuu();
    loadSubject().then(findSubjectData).then(() => {
        console.log(Sess['FixedSubjectInfo'])
    }).then(() => {
        // findAllCanReg(true)
        saveSession()
    });
    btn.innerText = 'ตรวจสอบข้อมูล'
    btn.classList.remove('disabled')
    btn.removeAttribute('disabled')
}

function saveSession() {
    var dumpCanAdd = [...Sess['canAdd']]
    Sess['canAdd'] = []
    sessionStorage.removeItem('theSession')
    sessionStorage.setItem('theSession', JSON.stringify(Sess));
    Sess['canAdd'] = dumpCanAdd
}

function sessionFetcher() {
    Sess = JSON.parse(sessionStorage.getItem('theSession'));
}

async function loadSubject() {
    await $.getJSON('SubjectOpen.json', function (data) {
        Sess['subjectData'] = data;
    });
    return Sess['subjectData'];
}

async function loadSubjectCard() {
    await $.get('subjectCard.html', function (data) {
        templateSubjectCard = data;
    });
    return templateSubjectCard;
}

async function loadBuu() {
    await $.getJSON('GEN.json', function (data) {
        Sess['BuuData'] = data;
    });
    return Sess['BuuData'];
}

function parseSubject() {
    var textbox = document.getElementById('subject_section');
    if (textbox.value == '') return [];
    var res = textbox.value.replace("\r", "").split("\n");
    res.forEach((val, index) => {
        var realval = val.split(" - ")[0]
        if (!/^0[0-9]{7}:[0-9]{1,}$/.test(realval)) {
            res.splice(index, 1)
        } else {
            if (realval.split(":")[1] < 100) {
                stdType = 1;
            } else if (realval.split(":")[1] < 500) {
                stdType = 2;
            } else {
                stdType = 3;
            }
        }
    })
    textbox.value = res.sort().join("\n");
    sessionStorage.setItem('subjectList', JSON.stringify(res));
    Sess['FixedSubject'] = res;
    return res;
}

function findSubjectData() {
    var newFixed = [];
    var timeslotconflict = null;
    Sess['subjectData'].results.some((sub) => {
        var subjectid = sub.subjectCode.slice(0, 8) + ":" + sub.sectionCode
        if (Sess['FixedSubject'].includes(subjectid)) {
            Sess['FixedSubjectInfo'].push(sub)
            newFixed.push(subjectid + " - " + sub.subjectNameEn + " (" + sub.sectionTypeEn + ")")
            Sess['currentCredit'] += sub.maxCredit;
            str2timearr(sub.coursedate).some((val) => {
                timeslotconflict = addsubject2timetable(val[0], val[1], val[2], subjectid + " - " + sub.subjectNameEn + " (" + sub.sectionTypeEn + ")");
                return timeslotconflict != null;
            })
            return timeslotconflict != null;
        }
        return false;
    })
    if (timeslotconflict != null) {
        Swal.fire({
            title: 'หมู่เรียนและช่วงเวลาต่อไปนี้ซ้อนกับหมู่เรียนอื่น',
            html: timeslotconflict,
            icon: 'warning',
            width: '48rem',
            showConfirmButton: false,
            cancelButtonText: 'กลับไปตรวจสอบข้อมูล',
            showCancelButton: true,
        })
    } else if (Sess['currentCredit'] > Sess['creditLimit']) {
        Swal.fire({
            title: 'คุณกรอกข้อมูลเกิน 22 หน่วยกิต',
            html: timeslotconflict,
            icon: 'warning',
            width: '48rem',
            showConfirmButton: false,
            cancelButtonText: 'กลับไปตรวจสอบข้อมูล',
            showCancelButton: true,
        })
    } else if (newFixed.length == Sess['FixedSubject'].length) {
        Swal.fire({
            // timer: 2000,
            title: 'พบข้อมูล ' + newFixed.length + ' หมู่เรียน',
            // timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            html: newFixed.sort().join("<br>"),
            icon: 'success',
            width: '48rem',
            showConfirmButton: false,
            footer: 'กำลังนำไปยังผลการค้นหา'
        })
        setTimeout(()=>{
            window.location = 'result.html'
        }, 2000)
    } else {
        Swal.fire({
            // timer: 2000,
            title: 'พบข้อมูลเพียง ' + newFixed.length + ' หมู่จาก ' + Sess['FixedSubject'].length + ' หมู่เรียน',
            // timerProgressBar: true,
            html: newFixed.sort().join("<br>"),
            icon: 'warning',
            width: '48rem',
            showConfirmButton: false,
            cancelButtonText: 'กลับไปตรวจสอบข้อมูล',
            showCancelButton: true,
        })
    }
}

function time2str(inttime) {
    return String(Math.floor(inttime / 60)).padStart(2, '0') + ":" + String(inttime % 60).padStart(2, '0')
}

function str2time(timestr) {
    var timearr = timestr.split(':')
    return parseInt(timearr[0]) * 60 + parseInt(timearr[1])
}

function dow2str(dow) {
    if (dow == 0) return 'SUN';
    if (dow == 1) return 'MON';
    if (dow == 2) return 'TUE';
    if (dow == 3) return 'WED';
    if (dow == 4) return 'THU';
    if (dow == 5) return 'FRI';
    if (dow == 6) return 'SAT';
}

function str2dow(strdow) {
    if (strdow == 'SUN') return 0;
    if (strdow == 'MON') return 1;
    if (strdow == 'TUE') return 2;
    if (strdow == 'WED') return 3;
    if (strdow == 'THU') return 4;
    if (strdow == 'FRI') return 5;
    if (strdow == 'SAT') return 6;
    if (DEBUG) console.log('STR2DOW:', strdow);
}

function str2timearr(strtime) {
    if (strtime == '') return [];
    if (!/^[A-Z]{3}  [0-9]{1,2}:[0-9]{1,2}/.test(strtime)) return [];
    var times = strtime.split(',');
    var arr_res = [];
    times.forEach((ctime) => {
        var timeinfo = ctime.split('  ');
        var timerange = timeinfo[1].split(' - ');
        arr_res.push([str2time(timerange[0]), str2time(timerange[1]), str2dow(timeinfo[0])])
    })
    return arr_res;
}

function checkTimeAvailable(start_time, end_time, dow) {
    if (DEBUG) {
        // console.log(start_time, end_time, dow);
    }
    return !Sess['timetable'][dow].some((timeslot) => {
        return !(timeslot[1] <= start_time || timeslot[0] >= end_time)
    })
}

function addsubject2timetable(start_time, end_time, dow, subName) {
    if (checkTimeAvailable(start_time, end_time, dow)) {
        if (start_time != end_time) Sess['timetable'][dow].push([start_time, end_time, subName]);
        return null;
    } else {
        if (DEBUG) {
            console.log(subName, dow2str(dow), time2str(start_time), 'to', time2str(end_time));
        }
        return subName + "<br>" + dow2str(dow) + '  ' + time2str(start_time) + ' ' + 'to' + ' ' + time2str(end_time);
    }
}

function findAllCanReg(GenFilter = false, Credit = false, DepYear = false, SectionType = false, GenType = false, DepSpecific = true) {
    Sess['canAdd'] = []
    Sess['subjectData'].results.forEach((sub) => {
        // console.log(sub)
        if (stdType == 1 && !(sub.sectionCode < 100)) return;
        if (stdType == 2 && !(sub.sectionCode < 500 && sub.sectionCode >= 200)) return;
        if (stdType == 3 && !(sub.sectionCode >= 500)) return;

        if (str2timearr(sub.coursedate).some((val) => {
                return !checkTimeAvailable(val[0], val[1], val[2])
            })) return;
        // if (sub.subjectCode.slice(5, 6) > '4') return; // only b degree

        if (Sess['currentCredit'] + sub.maxCredit > Sess['creditLimit']) return; // Within 22


        if (GenFilter && !Sess['BuuData'].hasOwnProperty(sub.subjectCode.slice(0, 8))) return; // Hide Buu

        if (DepYear !== false && sub.property != null && sub.property != 'ALL' && sub.property != '-') {
            var FacCode = DepYear.slice(0, 1);
            var DepCode = DepYear.slice(1, 3);
            var YearCode = DepYear.slice(4, 5);
            if (DepSpecific) {
                var regex = new RegExp("^" + DepYear + "$");
            } else {
                var regex = new RegExp("^(" + FacCode + "(" + DepCode + ")?)?(-[1-" + YearCode + "])?$");
            }
            var someNotPass = sub.property.split(',').some((val) => {
                return !regex.test(val)
            })
            if (someNotPass) return;
        }
        if (DepYear !== false && DepSpecific  && (sub.property == null || sub.property == 'ALL' || sub.property == '-')) return;
        // console.log(sub.property)
        if (GenType !== false && sub.type != GenType) return;
        if (Credit !== false && sub.maxCredit != Credit) return;

        if (Sess['BuuData'].hasOwnProperty(sub.subjectCode.slice(0, 8))) {
            sub = Object.assign({}, Sess['BuuData'][sub.subjectCode.slice(0, 8)], sub)
            // if (sub.type != 'ภาษากับการสื่อสาร') return;
        } else if (GenType !== false) {
            return;
        }

        if (SectionType !== false && sub.sectionTypeEn != SectionType) return;


        Sess['canAdd'].push(sub);
    })
    if (Sess['canAdd'].length > 200) return [];
}