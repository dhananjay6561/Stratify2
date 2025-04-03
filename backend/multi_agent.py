import os
from mistralai import Mistral
import dotenv

# Load environment variables from .env file
dotenv.load_dotenv()


class CustomMistralClient:
    def __init__(self, api_key, model):
        self.api_key = api_key
        self.model = model
        self.client = Mistral(api_key=api_key)
        print("Mistral Client Initialized")

    def generate(self, prompt):
        print(f"Generating response for prompt: {prompt}")
        try:
            chat_response = self.client.chat.complete(
                model=self.model,
                messages=[{"role": "user", "content": prompt}]
            )
            response_content = chat_response.choices[0].message.content
            print(f"Response: {response_content}")
            return response_content
        except Exception as e:
            print(f"Error connecting to Mistral: {e}")
            raise Exception("Failed to connect to Mistral. Please check your API key and network connection.")

class MultiAgentConsensus:
    def __init__(self):
        api_key = os.environ.get("MISTRAL_API_KEY")
        print("API Key:", api_key)
        if not api_key:
            raise ValueError("MISTRAL_API_KEY environment variable not set")

        self.mistral_client = CustomMistralClient(
            api_key=api_key,
            model="mistral-large-latest"
        )

    def get_consensus(self, project_name, goals, team_members, tasks):
        tasks_formatted = ', '.join([
            f"{task['task_name']} (Required Skill: {task['required_skill']}, Duration: {task['duration']})"
            for task in tasks
        ])
        prompt = f"""
        You are a project management AI. Generate a detailed plan for the following project:

        Project Name: {project_name}
        Goals: {', '.join(goals)}
        Team Members: {', '.join([f"{member['name']} (Skills: {', '.join(member['skills'])})" for member in team_members])}
        Tasks: {tasks_formatted}


        The plan should include:
        1. Task allocation based on team members' skills.
        2. A timeline for task completion.
        3. Team structuring recommendations.

        Give a brief summary of the project and its goals, and then provide the detailed plan in bulleted format for easy reading. Generate the response in JSON format.
        """
        print(f"Prompt: {prompt}")
        response = self.mistral_client.generate(prompt)
        return [{"role": "assistant", "content": response}]

# Example usage
if __name__ == "__main__":
    consensus = MultiAgentConsensus()
    project_name = "Example Project"
    goals = ["Backend creation", "Frontend creation", "Deployment"]
    team_members = [{"name": "Alice", "skills": ["Python", "Machine Learning"]}, {"name": "Bob", "skills": ["JavaScript", "Frontend"]}, {"name": "cob", "skills": ["JavaScript", "Frontend"]}]
    tasks = [
        {"task_name": "Develop Backend", "required_skill": "Python", "duration": "6 weeks"},
        {"task_name": "Create Frontend UI", "required_skill": "JavaScript", "duration": "3 weeks"}
    ]
    response = consensus.get_consensus(project_name, goals, team_members, tasks)
    print(response)
