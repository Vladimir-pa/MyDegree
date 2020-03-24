<template>
  <tr>
    <td>
      <select
        v-model.number.lazy="course.type"
        :select-on-tab="true"
        class="form-control courseType"
        @change.stop="updateField('type')"
      >
        <template v-for="(type, index_2) in course_types">
          <option :key="index_2" :value="index_2">{{ type.name }} </option>
        </template>
      </select>
    </td>
    <td style="min-width: 90px">
      <input
        v-model.number.lazy="course.number"
        class="form-control courseNumber"
        max="9999999"
        min="0"
        step="1"
        type="number"
        @change="updateField('number')"
      />
    </td>
    <td style="min-width: 250px;padding-right: 0">
      <input
        v-model.lazy="course.name"
        class="form-control courseName"
        type="text"
        @change="updateField('name')"
      />
    </td>
    <td style="min-width: 60px">
      <input
        v-model.number.lazy="course.points"
        :class="[course.points >= 0 ? '' : InputIsWrong]"
        class="form-control coursePoints"
        max="500"
        min="0"
        step="0.5"
        type="number"
        @change="updateField('points')"
      />
    </td>
    <td style="min-width: 60px">
      <input
        v-model.number.lazy="course.grade"
        :class="[course.grade >= 0 && course.grade <= 100 ? '' : InputIsWrong]"
        class="form-control courseGrade"
        max="100"
        min="0"
        step="1"
        type="number"
        @change="updateField('grade')"
      />
    </td>
    <td class="text-center" style="min-width: 45px">
      <b-dropdown
        id="dropdown-1"
        v-b-tooltip.hover.v-secondary
        dropleft
        title="פעולות על שורה"
        variant="outline-dark"
      >
        <b-dropdown-item @click="clearRow">
          <font-awesome-icon
            icon="broom"
            size="sm"
            style="color: black; margin-left: 5px;"
          />
          נקה שורה
        </b-dropdown-item>
        <b-dropdown-item @click="deleteRow">
          <font-awesome-icon
            icon="minus"
            size="sm"
            style="color: black; margin-left: 10px;"
          />
          הסר שורה
        </b-dropdown-item>
        <b-dropdown-item @click="moveCourseInner('up')">
          <font-awesome-icon
            icon="arrow-up"
            size="sm"
            style="color: black; margin-left: 10px;"
          />
          העלה
        </b-dropdown-item>
        <b-dropdown-item @click="moveCourseInner('down')">
          <font-awesome-icon
            icon="arrow-down"
            size="sm"
            style="color: black; margin-left: 10px;"
          />
          הורד
        </b-dropdown-item>
      </b-dropdown>
    </td>
  </tr>
</template>
<script>
import { clearCourse } from "../store/classes/course";
import { createHelpers } from "vuex-map-fields";

const { mapFields } = createHelpers({
  getterType: "getUserField",
  mutationType: "updateUserField"
});

export default {
  name: "SemesterTableCourseRow",
  // eslint-disable-next-line vue/require-prop-types
  props: ["course", "index", "moveFunction"],
  data() {
    return {
      InputIsWrong: "inputIsWrong"
    };
  },
  computed: {
    ...mapFields(["course_types"])
  },
  methods: {
    clearRow() {
      clearCourse(this.course);
      this.$store.commit("reCalcCurrentSemester");
    },
    deleteRow() {
      this.$store.commit("removeCourse", this.index);
      this.$store.commit("reCalcCurrentSemester");
    },

    updateField(field) {
      let value = this.course[field];
      if (field)
        this.$store.commit("updateCourse", { field, value, index: this.index });
      this.$store.commit("reCalcCurrentSemester");
      this.$store.dispatch("updateSemesterAsync");
    },
    moveCourseInner(direction) {
      this.moveFunction(this.index, direction);
    }
  }
};
</script>

<style scoped>
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.inputIsWrong {
  border-color: red !important;
}

.courseType {
  text-align-last: center;
}

.courseNumber {
  text-align: center;
  direction: ltr;
}

.courseName {
  text-align: center;
  direction: rtl;
}

.courseGrade {
  text-align: center;
  direction: ltr;
}

.coursePoints {
  text-align: center;
  direction: ltr;
}

.clearButton {
}
</style>
