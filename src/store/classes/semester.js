import Course from './course.js'

export class Semester {
    constructor(name, courses_initially) {
        this.name = name.toString();
        this.average = 0;
        this.points = 0;
        this.courses = [];
        for (let i = 0; i < courses_initially; i++) {
            this.courses.push(new Course());
        }
    }

    addCourse() {
        this.courses.push(new Course);
    }

    addExistingCourse(course) {
        this.courses.push(course);
    }

    removeCourse(index) {
        if (index < this.courses.length && index >= 0) {
            this.courses.splice(index, 1);
        }
    }

    calculateAverage() {
        let points = 0;
        let total_grade = 0;
        for (const course of this.courses) {
            if (course.points != '' && course.grade != '') {
                points += course.points;
                total_grade += course.grade * course.points;
            }
        }
        if (points != 0) {
            this.average = total_grade / points;
        } else {
            this.average = 0;
        }
    }

    calculatePoints() {
        this.points = 0;
        for (const course of this.courses) {
            if (course.points != '') {
                this.points += course.points;
            }
        }
    }
}