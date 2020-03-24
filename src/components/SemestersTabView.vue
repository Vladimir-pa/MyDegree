<template>
  <b-card class="shadow bg-white rounded" no-body style="margin: 10px 20px">
    <b-tabs pills card nav-class="sortable" @input="updateActiveSemester">
      <b-tab
        v-for="semester in this.$store.state.user.semesters"
        :key="semester.name"
        :title="'סמסטר ' + semester.name"
        lazy
      >
        <div class="row justify-content-md-center">
          <div class="col-xl-10" style="margin-bottom: 10px;">
            <app-semester-table :semester="semester" />
          </div>
          <div class="col-xl-2" style="padding: 0 0">
            <app-semester-summary />
          </div>
        </div>
        <div class="row">
          <div class="col-xl-10"></div>
          <div class="col-xl-2">
            <b-button-group class="mx-1" style="direction: ltr">
              <b-button
                class="align-self-end"
                variant="outline-danger"
                size="sm"
                @click="closeTab"
              >
                מחק סמסטר
              </b-button>
              <b-button
                v-if="semester.name.toString().includes('קיץ')"
                class="align-self-end"
                size="sm"
                variant="outline-info"
                @click="changeToRegular"
              >
                הפוך לסמסטר רגיל
              </b-button>
              <b-button
                v-else
                class="align-self-end"
                size="sm"
                variant="outline-info"
                @click="changeToSummer"
              >
                הפוך לסמסטר קיץ
              </b-button>
            </b-button-group>
          </div>
        </div>
      </b-tab>

      <!-- New Tab Button (Using tabs slot) -->

      <!-- Render this if no tabs -->
      <div
        slot="empty"
        class="container justify-content-md-center alert alert-secondary text-center text-muted"
      >
        <h2>עוד לא נוספו סמסטרים</h2>

        <br />

        <b-button variant="outline-secondary" @click.prevent="newTab"
          >הוסף סמסטר
        </b-button>
      </div>
    </b-tabs>
  </b-card>
</template>

<script>
import AppSemesterSummary from "@/components/SemesterSummary";
import AppSemesterTable from "@/components/SemesterTable";
import firebase from "firebase/app";
import "firebase/auth";
import Sortable from "sortablejs/Sortable";

export default {
  name: "SemestersTabView",
  components: { AppSemesterTable, AppSemesterSummary },
  props: {
    semesters: {
      type: Array,
      default() {
        return {};
      }
    },
    sliceSemesters: {
      type: Function,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      tabCounter: 1
    };
  },
  mounted() {
    let authentication_status = localStorage.getItem("authenticated");
    const user = firebase.auth().currentUser;
    if (user == null) {
      if (authentication_status === "false") {
        let user_data = localStorage.getItem("saved_session_data");
        if (user_data !== null) {
          if (typeof user_data === "object") {
            this.$store.commit("setUserData", user_data);
          } else {
            this.$store.commit(
              "setUserData",
              JSON.parse(localStorage.getItem("saved_session_data"))
            );
          }
          this.$store.commit("checkForValidVersion");
        }
      }
    }
    let el = document.querySelector(".sortable");
    Sortable.create(el, {
      animation: 200,
      swapThreshold: 0.5,
      direction: "horizontal",
      onEnd: this.onEnd
    });
  },
  methods: {
    closeTab() {
      this.$bvModal
        .msgBoxConfirm("למחוק סמסטר זה?", {
          title: "אזהרה",
          size: "sm",
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
            this.$store.commit("removeSemester");
            this.$store.commit("reCalcCurrentSemester");
          }
        });
    },

    newTab() {
      this.$store.commit("addSemester", 1);
    },
    changeToSummer() {
      this.$store.commit("changeActiveSemesterType");
    },
    changeToRegular() {
      this.$store.commit("changeActiveSemesterType");
    },
    updateActiveSemester(tab_index) {
      this.$store.commit("changeSemesterTo", tab_index);
      this.$store.commit("reCalcCurrentSemester");
    },
    onEnd(evt) {
      this.sliceSemesters(evt);
    }
  }
};
</script>
