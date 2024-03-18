import {
  ActionRowBuilder,
  CommandInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

const editMessage = async (interaction: CommandInteraction) => {
  const messageLink = interaction.options.get("message-link")?.value as string;
  if (interaction.member?.user.id !== "483526944881639426")
    return await interaction.reply({
      content: "You don't have permission to use this command.",
      ephemeral: true,
    });
  const messageId = messageLink.split("/").pop();
  if (!messageId)
    return await interaction.reply({
      content: "Invalid message link",
      ephemeral: true,
    });

  // Show a prompt to enter the price
  const modal = new ModalBuilder()
    .setCustomId(`edit-message-${messageId}`)
    .setTitle("Edit message");

  const newMessageInput = new TextInputBuilder()
    .setCustomId("new-message-input")
    .setLabel("New message")
    .setStyle(TextInputStyle.Paragraph);

  const actionRow = new ActionRowBuilder().addComponents(newMessageInput);

  modal.addComponents(actionRow as any);

  await interaction.showModal(modal);
};

module.exports = {
  name: "edit-message",
  description: "Edits a message",
  execute: editMessage,
  options: [
    {
      name: "message-link",
      description: "The message link",
      type: 3,
      required: true,
    },
  ],
};
