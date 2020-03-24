<template>
  <div
    id="app"
    style="font-family: Alef, Roboto, Helvetica, Arial, sans-serif;min-width: 838px !important;"
  >
    <header-nav-bar />
    <div class="container-fluid">
      <semesters-tab-view
        style="margin: 5px"
        :slice-semesters="slice_semesters"
        :semesters="semesters"
      />
      <degree-summary />
      <dp-footer />
    </div>
  </div>
</template>

<script>
import SemestersTabView from "./components/SemestersTabView";
import HeaderNavBar from "./components/Header";
import DpFooter from "./components/Footer";
import DegreeSummary from "./components/DegreeSummary";
export default {
  name: "App",
  components: {
    DegreeSummary,
    DpFooter,
    HeaderNavBar,
    SemestersTabView
  },
  data() {
    return {
      semesters: this.$store.state.user.semesters
    };
  },
  methods: {
    slice_semesters(evt) {
      //We subtract 1 because the first item is always el-tabs__active-bar
      let oldIndex = evt.oldIndex;
      let newIndex = evt.newIndex;
      window.console.log(oldIndex + " " + newIndex);
      //Update the tabs array to reflect the change that was just made
      this.$store.state.user.semesters.splice(
        newIndex,
        0,
        this.$store.state.user.semesters.splice(oldIndex, 1)[0]
      );
      this.$store.commit("reCalcCurrentSemester");
      //Update the activeName to the item that was just moved
    }
  }
};
</script>

<style>
@import "./fonts/Alef/stylesheet.css";

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none !important;
  margin: 0;
}

/*//Firefox fix of input fields */
input[type="number"] {
  -moz-appearance: textfield; /* Firefox arrows on numeric fields */
}

@supports (-moz-appearance: none) {
  /*Firefox spin-box fix*/
  select {
    -moz-appearance: none !important;
    background: transparent
      url("data:image/gif;base64,R0lGODlhBgAGAKEDAFVVVX9/f9TU1CgmNyH5BAEKAAMALAAAAAAGAAYAAAIODA4hCDKWxlhNvmCnGwUAOw==")
      left center no-repeat !important;
    background-position: calc(5px) center !important;
  }
}

.dropdown-item {
  text-align: right !important;
}
</style>
