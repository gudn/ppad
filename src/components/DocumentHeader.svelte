<script lang="ts">
  import { useNavigate } from 'svelte-navigator'

  import type { PDocument } from '../models/documents'
  import documents from '../store/documents'

  import Dropdown from '../components/Dropdown.svelte'

  export let doc: PDocument

  const navigate = useNavigate()

  function deleteDocument() {
    documents.delete_(doc.key).then(() => navigate('/'))
  }
</script>

<header>
  <div>
    <h4>{doc.title}</h4>
    <Dropdown>
      <li>
        <div>File</div>
        <ul>
          <li>
            <div>Export</div>
            <ul>
              <li>JSON</li>
              <li>MarkDown</li>
            </ul>
          </li>
          <li>Print</li>
          <li class="danger" on:click={deleteDocument}>Delete</li>
        </ul>
      </li>
      <li>
        <div>Edit</div>
        <ul />
      </li>
    </Dropdown>
  </div>
  <hr />
</header>

<style lang="scss">
  @import '../styles/variables.scss';

  header {
    background-color: $background-color;
    padding: 0.5em 1em;
    z-index: 10;

    div {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 1em;
    }

    hr {
      margin-block-end: 0;
    }

    .danger {
      color: $danger-color;
    }
  }
</style>
