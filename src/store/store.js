import Vue from 'vue';
import Vuex from 'vuex';
import * as Semester from './classes/semester'
import {calculateAverage, calculatePoints, courseExistInSemesters} from './classes/semester'
import * as Course from './classes/course'
import firebase from "firebase/app";
import {getField, updateField} from 'vuex-map-fields';
import 'firebase/auth'
import 'firebase/firestore'
import {MathRound10} from "./aux/rounder";
import {saveJSON} from "./aux/download";
import {create_course_type, default_course_types_obj} from "@/store/classes/course_types";

Vue.use(Vuex);

function updateUserData(state) {
    if (localStorage.getItem('authenticated') === 'true') {
        const user = firebase.auth().currentUser;
        if (user != null) {
            firebase.firestore().collection('users').doc(user.uid).set(state.user).then((result) => {
                return typeof result;
            }).catch((reason => {
                window.console.log('Error uploading user-data (' + reason + ')');
            }));
        }
    } else {

        localStorage.setItem('saved_session_data', JSON.stringify(state.user));
        localStorage.setItem('authenticated', 'false');
    }
}

function resetRemovedCategory(state, category_id) {
    for (let semester of state.user.semesters) {
        for (let course of semester.courses) {
            if (course.type == category_id) {
                course.type = 0
            } else {
                if (course.type > category_id) {
                    course.type -= 1;
                }
            }
        }
    }
}

function renameSemesters(semesters) {
    if (!semesters || semesters.length < 0) {
        return
    }
    let summer_semesters = 0;
    for (let i = 0; i < semesters.length; i++) {
        if (semesters[i].name.toString().includes('קיץ')) {
            summer_semesters++
        } else {
            semesters[i].name = 1 + i - summer_semesters
        }
    }
}

function getSummerSemestersNumber(semesters) {
    if (!semesters || semesters.length < 0) {
        return 0
    } else {
        let summer_semesters = 0;
        for (let i = 0; i < semesters.length; i++) {
            if (semesters[i].name.toString().includes('קיץ')) {
                summer_semesters++;
            }
        }
        return summer_semesters
    }
}

function calculateUserInfo(state) {
    let current_semester = state.user.semesters[state.user.active_semester];
    const exemption_index = 1;
    if (current_semester != null) {
        if (state.user.english_exemption) {
            state.user.degree_points_done = 3;
            state.must_points = 0;
        } else {
            state.user.degree_points_done = 0;
        }
        state.user.degree_average = 0;
        state.user.degree_points_to_choose = state.user.degree_points - (state.user.english_exemption ? 3 : 0);
        state.user.degree_points_left = state.user.degree_points - (state.user.english_exemption ? 3 : 0);
        state.user.course_types[0].points_left = state.user.course_types[0].points_required - (state.user.english_exemption ? 3 : 0);
        state.user.course_types[1].points_left = 0;
        for (let course_type of state.user.course_types) {
            if (!(course_type.name === "חובה" || course_type.name === "פטור")) {
                course_type.points_left = course_type.points_required
            }
        }
        let courses_done = {};
        for (const semester of state.user.semesters.slice().reverse()) {
            Semester.calculateAverage(semester);
            Semester.calculatePoints(semester);
            for (const course of semester.courses) {
                if (course.name.includes('ספורט')
                    || course.name.includes('גופני')
                    || !((course.name in courses_done) && (course.number === courses_done[course.name][0] && courses_done[course.name][1] !== 0))
                ) {
                    let course_points = parseFloat(course.points);
                    if (!((course.name in courses_done) && (course.number === courses_done[course.name][0]))) {
                        state.user.course_types[course.type].points_left -= course_points
                        state.user.degree_points_to_choose -= course_points;
                    }
                    if (((parseInt(course.grade) > 0 && !(course.name in courses_done))
                        || (parseInt(course.grade) > 0 && (course.name.includes('ספורט') || course.name.includes('גופני'))))
                        || (course.name in courses_done && parseInt(courses_done[course.name][1]) === 0)) {
                        if (course.type !== exemption_index) {
                            state.user.degree_average += course_points * parseInt(course.grade);
                        }
                        state.user.degree_points_left -= course_points;
                        if (parseInt(course.grade) > 0 && course.type !== exemption_index) {
                            state.user.degree_points_done += course_points;
                        }

                    }
                    courses_done[course.name] = [course.number, course.grade];
                }
            }
        }
        if ((state.user.degree_points_done - (state.user.english_exemption ? 3 : 0)) !== 0) {
            state.user.degree_average /= (state.user.degree_points_done - (state.user.english_exemption ? 3 : 0));
            state.user.degree_average = MathRound10(state.user.degree_average, -1).toFixed(1);
        } else {
            state.user.degree_average = 0;
        }
        state.user.degree_points_left = state.user.degree_points - state.user.degree_points_done;
    }
    updateUserData(state);
}

export const store = new Vuex.Store({
    state: {
        logged: false,
        user_name: '',
        user: {
            summer_semesters: 0,
            active_semester: 0,
            degree_average: 0,
            degree_points: 0,
            degree_points_done: 0,
            degree_points_left: 0,
            degree_points_to_choose: 0,
            english_exemption: false,
            semesters: [],
            course_types: default_course_types_obj
        }
    },
    getters: {
        getField,
        getUserField(state) {
            return getField(state.user);
        },
    },
    mutations: {
        updateField,
        clearUserData: (state) => {
            state.user.active_semester = 0;
            state.user.summer_semesters = 0;
            state.user.degree_average = 0;
            state.user.degree_points = 0;
            state.user.degree_points_done = 0;
            state.user.degree_points_left = 0;
            state.user.degree_points_to_choose = 0;
            state.user.english_exemption = false;
            state.user.semesters = [];
            state.user.course_types = default_course_types_obj;
            updateUserData(state);
        },
        setUserData: (state, user_data) => {
            state.user = user_data;
            if (state.user.course_types === undefined) {
                state.user.course_types = default_course_types_obj
            }
            window.console.log(state.user.gavno);
            if (state.user.summer_semesters === undefined) {
                state.user.summer_semesters = 0;
            }
        },
        setActiveSemester: (state, index) => {
            state.user.active_semester = index;
        },
        setExemptionStatus: (state, status) => {
            state.user.english_exemption = status;
        },
        addSemester: (state, initial_courses) => {
            state.user.summer_semesters = getSummerSemestersNumber();
            state.user.semesters.push(Semester.createNewSemester(state.user.semesters.length + 1, initial_courses));
            renameSemesters(state.user.semesters);
            updateUserData(state);
        },
        sortSemesterByField: (state, fieldName) => {
            Semester.sortCoursesByField(state.user.semesters[state.user.active_semester], fieldName)
        },
        addCourse: (state) => {
            Semester.addCourseToSemester(state.user.semesters[state.user.active_semester]);
            updateUserData(state);
        },
        addCourseWithData: (state, course) => {
            Semester.addExistingCourse(state.user.semesters[state.user.active_semester], course);
            updateUserData(state);
        },
        updateCourse: (state, {field, value, index}) => {
            Object.assign(state.user.semesters[state.user.active_semester].courses[index], {[field]: value});
            updateUserData(state);
        },
        updateSemesterSummary: (state, {field, value}) => {
            Object.assign(state.user.semesters[state.user.active_semester], {[field]: value});
            updateUserData(state);
        },
        updateInfo: (state, {field, value}) => {
            Object.assign(state.user, {[field]: value});
            updateUserData(state);
        },
        removeCourse: (state, index) => {
            Semester.removeCourse(state.user.semesters[state.user.active_semester], index);
            updateUserData(state);
        },
        removeLastRow: (state) => {
            let current_semester = state.user.semesters[state.user.active_semester];
            let last_course_index = current_semester.courses.length - 1;
            if (!Course.courseIsEmpty(current_semester.courses[last_course_index])) {
                Semester.removeCourse(current_semester, last_course_index)
            } else {
                Semester.removeCourse(current_semester, last_course_index);
            }
            updateUserData(state);
        },
        removeSemester: (state) => {
            let semesters = state.user.semesters;
            if (semesters.length === 1) {
                state.user.semesters = [];
                state.user.summer_semesters = 0;
                return
            }
            semesters.splice(state.user.active_semester, 1);
            renameSemesters(semesters)
            state.user.summer_semesters = getSummerSemestersNumber(semesters);
            updateUserData(state);
        },
        changeSemesterTo: (state, index) => {
            state.user.active_semester = index;
            updateUserData(state);
        },
        addCourseType: (state, typeName) => {
            if (typeName.toString() !== "") {
                for (let type of state.user.course_types) {
                    if (type.name === typeName.toString()) {
                        return
                    }
                }
                state.user.course_types.push(create_course_type(typeName))
                updateUserData(state);
            }
        },
        changeActiveSemesterType: (state) => {
            let current_semester = state.user.semesters[state.user.active_semester];
            if (current_semester.name.toString().includes('קיץ')) {
                current_semester.name = 0
            } else {
                current_semester.name = 'קיץ'
            }
            renameSemesters(state.user.semesters);
            state.user.summer_semesters = getSummerSemestersNumber(state.user.semesters);
        },
        changeSemesterType: (state, index) => {
            let semester = state.user.semesters[index];
            if (semester.name.toString().includes('קיץ')) {
                semester.name = 0
            } else {
                semester.name = 'קיץ'
            }
            renameSemesters(state.user.semesters);
            state.user.summer_semesters = getSummerSemestersNumber(state.user.semesters);
        },
        changeCategoryName: (state, name_index) => {
            if (name_index[1] < state.user.course_types.length) {
                state.user.course_types[name_index[1]].name = name_index[0]
            }
            calculateUserInfo(state);
        },
        deleteCourseType: (state, index) => {
            if (index < state.user.course_types.length) {
                resetRemovedCategory(state, index);
                state.user.course_types.splice(index, 1);
            }
            calculateUserInfo(state);
        },
        reCalcCurrentSemester: (state) => {
            if (state.user.semesters.length > 0) {
                calculateUserInfo(state);
            }
        },
        checkForValidVersion: (state) => {
            if (state.user.course_types === "undefined") {
                state.user.course_types = default_course_types_obj
            }
        },
        updateSemester: (state) => {
            const user = firebase.auth().currentUser;
            if (user != null) {
                firebase.firestore().collection('users').doc(user.uid).update({
                    semesters: state.user.semesters
                })
            }
        },
        exportSemesters: (state) => {
            let copy = JSON.stringify(state.user.semesters);
            copy = JSON.parse(copy);
            for (let sem of copy) {
                for (let course of sem.courses) {
                    course.grade = 0;
                }
                calculatePoints(sem);
                calculateAverage(sem);
            }
            let data = JSON.stringify(copy, undefined, 2);
            saveJSON(data, 'grades.json');

        },
        importCoursesFromJson: (state, data) => {
            state.user.semesters = (JSON.parse(data));
        },
        fetchUserInfo: (state, user) => {
            state.user = user;
        },
        checkIfCourseExists: (state, course_number_and_answer) => {
            course_number_and_answer['answer'] = courseExistInSemesters(state.user.semesters, course_number_and_answer.course_number);
        },
        checkPrerequisites: (state, course_number_and_answer) => {
            course_number_and_answer['answer'] = courseExistInSemesters(state.user.semesters, course_number_and_answer.course_number, state.user.active_semester - 1);
        },
        checkLinear: (state, course_number_and_answer) => {
            course_number_and_answer['answer'] = courseExistInSemesters(state.user.semesters, course_number_and_answer.course_number, state.user.active_semester);
        },
        updateUserField(state, field) {
            if (state.user) {
                updateField(state.user, field);
                calculateUserInfo(state);
            }
        },
        updateSemesters(state, semesters) {
            state.user.semesters = semesters
        },


    },
    actions: {
        updateSemesterAsync(context) {
            const user = firebase.auth().currentUser;
            if (user) {
                context.commit('updateSemester');
            }

        },
        addNewSemesterFromData: (context, course_list) => {
            context.commit('addSemester', 0);
            context.commit('changeSemesterTo', context.state.user.semesters.length - 1);
            for (let course of course_list) {
                context.commit('addCourseWithData', course);
            }
        },
        loadUserDataFromUGSite: ({commit}, semesters_exemption_summerIndexes) => {
            commit('clearUserData');
            let index = 0;
            for (let semester in semesters_exemption_summerIndexes['semesters']) {
                commit('addSemester', 0);
                commit('setActiveSemester', index);
                for (let course of semesters_exemption_summerIndexes['semesters'][semester]) {
                    commit('addCourseWithData', course);
                }
                index += 1;
            }
            commit('setExemptionStatus', (semesters_exemption_summerIndexes['exemption']));
            commit('reCalcCurrentSemester');
            commit('changeSemesterTo', semesters_exemption_summerIndexes['semesters'].length - 1)
            let summer_semesters_indexes = semesters_exemption_summerIndexes['summer_semesters_indexes']
            for (let i = 0; i < summer_semesters_indexes.length; i++) {
                commit('changeSemesterType', summer_semesters_indexes[i])
            }
        },
    }
});
