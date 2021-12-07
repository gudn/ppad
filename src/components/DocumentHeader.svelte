<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { useNavigate } from 'svelte-navigator'

  import type { PDocument } from '../models/documents'
  import documents from '../store/documents'

  import Dropdown from '../components/Dropdown.svelte'

  export let doc: PDocument
  export let toJson: (doc: PDocument) => Promise<string>

  const navigate = useNavigate()
  const dispatch = createEventDispatcher()

  let docTitle = doc.title
  let editTitle = false

  function deleteDocument() {
    documents.delete_(doc.key).then(() => navigate('/'))
  }

  function openView() {
    window.open(`/view/${doc.key}`, '_blank').focus()
  }

  function download(filename: string, text: string) {
    var elem = document.createElement('a')
    elem.setAttribute(
      'href',
      'data:application/json;charset=utf-8,' + encodeURIComponent(text),
    )
    elem.setAttribute('download', filename)

    elem.style.display = 'none'
    document.body.appendChild(elem)

    elem.click()

    document.body.removeChild(elem)
  }

  async function exportJson() {
    const json = await toJson(doc)
    download(`${doc.key}.json`, json)
  }

  function titleEditor(node: HTMLInputElement) {
    node.addEventListener('blur', () => (editTitle = false))
    node.focus()

    return {
      destroy() {
        docTitle = docTitle.trim()
        dispatch('rename', docTitle)
      },
    }
  }
</script>

<header>
  <div>
    {#if editTitle}
      <input use:titleEditor type="text" bind:value={docTitle} />
    {:else}
      <h4 on:click={() => (editTitle = true)}>{docTitle}</h4>
    {/if}
    <Dropdown>
      <li>
        <div>File</div>
        <ul>
          <li on:click={openView}>Print</li>
          <li on:click={exportJson}>Export JSON</li>
          <li class="danger" on:click={deleteDocument}>Delete</li>
        </ul>
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
      justify-content: space-between;
      gap: 1em;
    }

    hr {
      margin-block-end: 0;
    }

    input {
      font-size: 20px;
      border: 1px solid rgba(0, 0, 0, 0.3);
      background-color: $primary-color;
      border-radius: 4px;
      color: $text-color;
      margin-block-start: 1.33em;
      margin-block-end: 1.33em;

      &:active {
        outline-color: $text-color;
      }
    }
  }
</style>
