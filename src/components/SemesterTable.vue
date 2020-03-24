<template>
  <div>
    <div class="row">
      <table
        class="table table-sm table-borderless"
        style="margin-right: 5px; "
      >
        <semester-header />
        <tbody>
          <semester-table-row
            v-for="(course, index) in semester.courses"
            :key="course.name + course.number"
            :course="course"
            :index="index"
            :move-function="moveFunction"
          />
        </tbody>
      </table>
    </div>
    <div
      class="row justify-content-md-center"
      style="justify-content: center !important;"
    >
      <b-button-group class="mx-1" style="direction: ltr">
        <b-button variant="outline-danger" @click="removeLastRow"
          >הסר שורה
        </b-button>

        <b-button variant="info" @click="showModal">חיפוש קורסים </b-button>
        <modal
          :max-height="800"
          :min-height="380"
          :min-width="550"
          height="auto"
          name="search"
          scrollable
        >
          <search-course-dialog />
        </modal>
        <b-button variant="outline-primary" @click="addRow"
          >הוסף שורה
        </b-button>
      </b-button-group>
    </div>
  </div>
</template>

<script>
import SemesterTableRow from "@/components/SemesterTableRow";
import SemesterHeader from "@/components/SemesterTableHeader";
import SearchCourseDialog from "./SearchCourseDialog";
import Vue from "vue";

export default {
  name: "SemesterTable",
  components: { SemesterTableRow, SemesterHeader, SearchCourseDialog },
  props: {
    semester: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      headerTextVariant: "light",
      headerBgVariant: "dark",
      alignment: "flex-end"
    };
  },
  methods: {
    moveFunction(index, direction) {
      if (
        !(
          (index === this.semester.courses.length - 1 &&
            direction === "down)") ||
          (index === 0 && direction === "up")
        )
      ) {
        if (direction === "up") {
          let temp = this.semester.courses[index - 1];
          Vue.set(
            this.semester.courses,
            index - 1,
            this.semester.courses[index]
          );
          Vue.set(this.semester.courses, index, temp);
        } else if (direction === "down") {
          let temp = this.semester.courses[index + 1];
          Vue.set(
            this.semester.courses,
            index + 1,
            this.semester.courses[index]
          );
          Vue.set(this.semester.courses, index, temp);
        }
      }
      this.$store.commit("reCalcCurrentSemester");
    },
    showModal() {
      this.$modal.show("search");
    },
    addRow() {
      this.$store.commit("addCourse");
    },
    removeLastRow() {
      this.$bvModal
        .msgBoxConfirm("למחוק שורה בעלת תוכן?", {
          title: "אזהרה",
          size: "sm",
          headerBgVariant: "dark",
          headerTextVariant: "white",
          buttonSize: "md",
          cancelDisabled: "true",
          okVariant: "danger",
          okTitle: "כן",
          cancelTitle: "לא",
          autoFocusButton: "ok",
          footerClass: "p-2",
          hideHeaderClose: true,
          centered: true
        })
        .then(v => {
          if (v === true) {
            this.$store.commit("removeLastRow");
            this.$store.commit("reCalcCurrentSemester");
          }
        });
    }
  }
};
</script>
