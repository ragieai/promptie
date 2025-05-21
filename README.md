# Promptie

A tool for testing prompts and generations with Ragie. This is a Next.js application that allows you to experiment with AI text generation using the Ragie knowledge retrieval system and Anthropic's Claude AI.

<img width="302" alt="image" src="https://github.com/user-attachments/assets/920b33fb-4f07-44bb-b6bb-d266c0857d60" />
<img width="302" alt="image" src="https://github.com/user-attachments/assets/29e99518-45be-4214-a48a-4d06440d00b7" />
<img width="302" alt="image" src="https://github.com/user-attachments/assets/e19f0ce5-64f8-4e62-bf1a-7406be16e23e" />




## Features

- Interactive prompt testing interface
- System prompt customization
- Knowledge retrieval with Ragie
- Response generation with Anthropic AI or OpenRouter
- Citation support for retrieved information
- Configurable parameters (partition, topK, rerank)
- Configurable LLM provider (Anthropic or OpenRouter)

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Ragie API key (Get one at https://secure.ragie.ai)
- Anthropic API key (if using Anthropic as the LLM provider)
- OpenRouter API key (if using OpenRouter as the LLM provider, get one at https://openrouter.ai/)

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/promptie.git
cd promptie
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
   - Create a `.env` file in the root directory by copying `.env.example`.
   - Add your API keys and configure the LLM provider as shown below. Refer to the comments in the `.env.example` file for more details.

   ```env
   # Your Ragie API key (Get one at https://secure.ragie.ai)
   RAGIE_API_KEY=your_ragie_api_key_here

   # --- LLM Provider Configuration ---

   # LLM_PROVIDER: Choose your LLM provider.
   # Options: "anthropic" or "openrouter".
   # If not set, the application defaults to "anthropic".
   # Example: LLM_PROVIDER=openrouter
   LLM_PROVIDER=anthropic

   # ANTHROPIC_API_KEY: Your Anthropic API key.
   # Required if LLM_PROVIDER is "anthropic" or if LLM_PROVIDER is not set.
   # Get one from https://www.anthropic.com/
   ANTHROPIC_API_KEY=your_anthropic_api_key_here

   # OPENROUTER_API_KEY: Your OpenRouter API key.
   # Required if LLM_PROVIDER is set to "openrouter".
   # Get one from https://openrouter.ai/
   OPENROUTER_API_KEY=your_openrouter_api_key_here

   # OPENROUTER_MODEL: The model to use with OpenRouter.
   # Required if LLM_PROVIDER is set to "openrouter".
   # Examples: "google/gemini-pro-1.5-flash", "openai/gpt-4-turbo", "mistralai/mistral-7b-instruct"
   # Refer to OpenRouter documentation for a full list of available models and their identifiers.
   OPENROUTER_MODEL=google/gemini-pro-1.5-flash
   ```

## Development

Start the development server:

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Usage

1. Enter your message in the input field
2. Configure parameters as needed:
   - **Partition**: Set knowledge partition (default: "default")
   - **Top K**: Number of results to retrieve (default: 6)
   - **Rerank**: Toggle to enable/disable result reranking
3. Click "Send" to generate a response
4. View the generated text and citations

## Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## Technologies

- [Next.js](https://nextjs.org/) - React framework
- LLM Providers:
  - [Anthropic Claude](https://www.anthropic.com/claude) - AI assistant
  - [OpenRouter](https://openrouter.ai/) - Access various LLMs via a single API
- [Ragie](https://ragie.ai/) - Knowledge retrieval system
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## License

This project is licensed under the MIT License - see the LICENSE file for details.
