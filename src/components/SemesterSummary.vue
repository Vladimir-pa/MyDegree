<template>
  <div
    class="container"
    style="max-width: 300px
"
  >
    <div class="col align-self-start" style="padding: 0 0">
      <table class="table table-borderless">
        <thead class="thead-light">
          <tr>
            <th
              colspan="2"
              scope="col"
              style="text-align: center;padding:.3rem"
            >
              סיכום סמסטר
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="width:  30%; text-align: right; padding-bottom: 0">
              <label style="margin: 8px 0 8px 0;  text-align: right;"
                >ממוצע:</label
              >
            </td>
            <td style="width:  70%; padding-bottom: 0;">
              <input
                v-model.number="
                  this.$store.state.user.semesters[
                    this.$store.state.user.active_semester
                  ].average
                "
                class="form-control"
                max="100"
                min="0"
                readonly
                step="0.01"
                style="text-align: center;direction: ltr;cursor: default;"
                type="number"
              />
            </td>
          </tr>
          <tr>
            <td style="width:  30%; text-align: right">
              <label style="margin: 8px 0 8px 0; ">נקודות:</label>
            </td>
            <td style="width:  70%">
              <input
                v-model.number="
                  this.$store.state.user.semesters[
                    this.$store.state.user.active_semester
                  ].points
                "
                class="form-control"
                max="300"
                min="0"
                readonly
                step="0.5"
                style="text-align: center;width: 100%;direction: ltr;cursor: default;"
                type="number"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "SemesterSummary"
};
</script>
