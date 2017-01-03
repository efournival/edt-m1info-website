"use strict";

var opt;
var mandatory = ["Opti. Combi.", "Prog.Paral"];

function clear(str) {
    // Bricolage
    str = str.replace(/Proba\ et\ Stat\./i, "Proba et Stat");
    str = str.replace(/IA:Log\.Cont\.\ TD\ IA:Log\.Cont\./i, "IA:Log.Cont.");
    str = str.replace(/Opti\.Comb\./i, "Opti. Combi.");

    str = str.replace(/\s*salle\s*:\s*/i, "");
    str = str.replace(/\s*TP\s*/i, "");
    str = str.replace(/\s*TD\s*/i, "");
    str = str.replace(/\s*PARTIEL\s*:*\s*/i, "");
    str = str.replace(/\s*\(.*\)\s*/i, "");
    str = str.replace(/\s*Cours\ fonda\.\s*/i, "");
    return str.trim();
}

function getCal(sourceICAL, callback) {
    nanoajax.ajax({ url: sourceICAL }, function(code, responseText) {
        callback(new ICAL.Component(ICAL.parse(responseText)));
    });
}

function getCourses(cal) {
    var courses = [];

    cal.getAllSubcomponents().forEach(function(e) {
        var name = clear(e.getFirstPropertyValue("summary"));

        if (courses.indexOf(name) === -1 && name.length > 0) {
            courses.push(name);
        }
    });

    return courses;
}

function setOption(e, str) {
    if (e.target.tagName === "INPUT") {
        var index = opt.indexOf(str);

        if (index > -1) {
            opt.splice(index, 1);
        } else {
            opt.push(str);
        }
    }
}

function generate(cal) {
    var outcal = new ICAL.Component(["vcalendar", [], []]);

    cal.getAllSubcomponents("vevent").forEach(function(e) {
        opt.some(function(o) {
            if (clear(e.getFirstPropertyValue("summary")).toLowerCase().match(clear(o.toLowerCase()))) {
                outcal.addSubcomponent(e);
                return true;
            }
        });
    });

    saveTextAs(outcal.toString(), "edt.ical");
}

function customize() {
    getCal("edt.ical", function(cal) {
        var courses = getCourses(cal).sort();

        var sopt = "<div id=\"options\">";
        courses.forEach(function(e) {
            sopt += "<p><label onClick=\"javascript:setOption(event, '" + e + "')\"><input type=\"checkbox\" " + (mandatory.indexOf(e) === -1 ? "" : "disabled checked") + "/>&nbsp;" + e + "</label></p>";
        });
        sopt += "</div>";

        opt = mandatory.slice(0);

        swal({
            title: "Personnaliser",
            text: "<p>Veuillez cocher les cours et options à inclure dans votre <code>.ical</code> personnalisé&nbsp;:</p>" + sopt,
            html: true,
            confirmButtonText: "Télécharger",
            allowOutsideClick: true
        }, function(isConfirm) {
            if (isConfirm) {
                generate(cal);
            }
        });
    });
}
