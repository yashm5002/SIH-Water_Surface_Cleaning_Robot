import pygame
import pyvirtualcam
import numpy as np

# Initialize Pygame
pygame.init()

# Create a Pygame window
width, height = 640, 480
screen = pygame.display.set_mode((width, height))
pygame.display.set_caption("Pygame Stream")

# Initialize Virtual Camera
with pyvirtualcam.Camera(width, height, 30) as cam:
    print(f'Using virtual camera: {cam.device}')

    running = True
    while running:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Clear the screen to white
        screen.fill((255, 255, 255))

        # Draw something
        pygame.draw.circle(screen, (0, 255, 0), (width // 2, height // 2), 50)

        # Update the display
        pygame.display.flip()

        # Get the Pygame surface and convert it to a format suitable for pyvirtualcam
        frame = pygame.surfarray.array3d(screen)
        frame = np.swapaxes(frame, 0, 1)  # Convert to (width, height, 3) format

        # Send the frame to the virtual camera
        cam.send(frame)
        cam.sleep_until_next_frame()

    pygame.quit()
