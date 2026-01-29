'''
Create a Rock Paper Scissor game where the player inputs their choice and plays against a
computer that randomly selects its move, the the game showing who won each round.
Add a score counter that tracks player and computer wins, and allow the game to continue 
until the player types 'quit'.
'''

import random


def rock_paper_scissor():
    choices = ['rock', 'paper', 'scissor']
    # Accept both 'scissor' and 'scissors' from the user and short inputs r/p/s
    mapping = {'r': 'rock', 'p': 'paper', 's': 'scissor', 'scissors': 'scissor'}

    player_score = 0
    computer_score = 0

    print("Welcome to Rock, Paper, Scissor!")
    print("Type 'rock', 'paper', or 'scissor' (or use 'r', 'p', 's') to play. Type 'quit' to exit the game.")

    while True:
        raw = input("Your choice: ").strip().lower()
        if raw == 'quit':
            print("Thanks for playing!")
            break

        player_choice = mapping.get(raw, raw)

        if player_choice not in choices:
            print("Invalid choice. Please try again.")
            continue

        computer_choice = random.choice(choices)
        print(f"Computer chose: {computer_choice}")

        if player_choice == computer_choice:
            print("It's a tie!")
        elif (player_choice == 'rock' and computer_choice == 'scissor') or \
             (player_choice == 'paper' and computer_choice == 'rock') or \
             (player_choice == 'scissor' and computer_choice == 'paper'):
            print("You win!")
            player_score += 1
        else:
            print("Computer wins!")
            computer_score += 1

        print(f"Score - You: {player_score}, Computer: {computer_score}")


if __name__ == "__main__":
    rock_paper_scissor()
