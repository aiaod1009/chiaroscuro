<template>
  <div class="postcards-page page-bg">
    <MailboxPostcards />
  </div>
</template>

<script>
import MailboxPostcards from './components/MailboxPostcards.vue';

export default {
  name: 'PostcardsView',
  components: { MailboxPostcards }
};
</script>

<style scoped>
.postcards-page {
  margin-top: -5rem;
  padding-top: 5rem;
}
</style>
