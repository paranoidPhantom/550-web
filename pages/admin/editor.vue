<script setup lang="ts">
import { computedAsync } from '@vueuse/core'
import { parseMarkdown } from "@nuxtjs/mdc/dist/runtime"

definePageMeta({
	name: "Редактор",
	layout: "admin",
	// middleware: "auth"
})

const input = ref("")
const preview = computedAsync(async () => {
	let initialText = input.value
	const tree = await parseMarkdown(initialText)
	return tree
}, null)
</script>

<template>
	<div class="__editor">
		<UTextarea class="input" placeholder="Введите Markdown разметку..." v-model="input" />
		<div class="line"></div>
		<div class="preview">
			<MarkdownForamatter>
				<ContentRendererMarkdown v-if="preview" :value="preview" />
				<div class="no-preview" style="opacity: 0.8;" v-if="input === ''">
					<h3 style="display: flex; align-items: center; gap: 0.5rem;">
						<Icon name="line-md:question-circle" /> Начните писать в поле и увидите изменения в этом окне
					</h3>
					<li>Чтобы добавить заголовок напишите: <blockquote># [Заголовок]</blockquote>
					</li>
					<li>Чтобы добавить элемент списка напишите: <blockquote>- [Элемент списка]</blockquote>
					</li>
				</div>
			</MarkdownForamatter>
		</div>
	</div>
</template>

<style lang="scss">
.__editor {
	display: flex;
	padding: 1rem;
	gap: 1rem;
	justify-content: space-between;

	.line {
		background-color: rgba(var(--inverted-rgb), 0.2);
		width: 1px;
	}

	.input {
		min-width: calc(50% - 2rem);
		height: calc(100vh - 5rem);

		textarea {
			height: inherit;
		}
	}

	.preview {
		min-width: calc(50% - 2rem);
		height: calc(100vh - 5rem);
		overflow-y: auto;
	}
}
</style>