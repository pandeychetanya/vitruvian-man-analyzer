#!/usr/bin/env python3
"""
Vitruvian Man Analyzer - AI/ML Human Pose Analysis
Analyzes human poses in images to determine how closely they match 
Leonardo da Vinci's Vitruvian Man proportions and geometry.
"""

import cv2
import numpy as np
import mediapipe as mp
import math
from typing import Tuple, Dict, List, Optional
import argparse
import json

class VitruvianAnalyzer:
    def __init__(self):
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            enable_segmentation=False,
            min_detection_confidence=0.7
        )
        self.mp_draw = mp.solutions.drawing_utils
        
    def analyze_image(self, image_path: str) -> Dict:
        """Analyze an image for Vitruvian Man proportions."""
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
            
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(image_rgb)
        
        if not results.pose_landmarks:
            return {"error": "No human pose detected in image"}
            
        landmarks = results.pose_landmarks.landmark
        h, w = image.shape[:2]
        
        # Extract key body points
        body_points = self._extract_body_points(landmarks, w, h)
        
        # Calculate proportions and geometry
        proportions = self._calculate_proportions(body_points)
        geometry = self._analyze_geometry(body_points)
        vitruvian_score = self._calculate_vitruvian_score(proportions, geometry)
        
        return {
            "vitruvian_score": vitruvian_score,
            "proportions": proportions,
            "geometry": geometry,
            "body_points": body_points,
            "analysis": self._generate_analysis(vitruvian_score, proportions, geometry)
        }
    
    def _extract_body_points(self, landmarks, w: int, h: int) -> Dict:
        """Extract key body landmark coordinates."""
        points = {}
        key_landmarks = {
            'nose': 0, 'left_eye': 1, 'right_eye': 2,
            'left_shoulder': 11, 'right_shoulder': 12,
            'left_elbow': 13, 'right_elbow': 14,
            'left_wrist': 15, 'right_wrist': 16,
            'left_hip': 23, 'right_hip': 24,
            'left_knee': 25, 'right_knee': 26,
            'left_ankle': 27, 'right_ankle': 28
        }
        
        for name, idx in key_landmarks.items():
            landmark = landmarks[idx]
            points[name] = (int(landmark.x * w), int(landmark.y * h))
            
        return points
    
    def _calculate_proportions(self, points: Dict) -> Dict:
        """Calculate body proportions following Vitruvian principles."""
        # Head length (top to chin approximation)
        head_length = self._distance(points['nose'], 
                                   ((points['left_shoulder'][0] + points['right_shoulder'][0]) // 2,
                                    (points['left_shoulder'][1] + points['right_shoulder'][1]) // 2))
        
        # Total height (head to feet)
        total_height = abs(points['nose'][1] - 
                          min(points['left_ankle'][1], points['right_ankle'][1]))
        
        # Arm span
        arm_span = self._distance(points['left_wrist'], points['right_wrist'])
        
        # Torso length
        torso_length = self._distance(
            ((points['left_shoulder'][0] + points['right_shoulder'][0]) // 2,
             (points['left_shoulder'][1] + points['right_shoulder'][1]) // 2),
            ((points['left_hip'][0] + points['right_hip'][0]) // 2,
             (points['left_hip'][1] + points['right_hip'][1]) // 2)
        )
        
        # Leg length
        leg_length = self._distance(
            ((points['left_hip'][0] + points['right_hip'][0]) // 2,
             (points['left_hip'][1] + points['right_hip'][1]) // 2),
            ((points['left_ankle'][0] + points['right_ankle'][0]) // 2,
             (points['left_ankle'][1] + points['right_ankle'][1]) // 2)
        )
        
        return {
            'head_to_total_ratio': head_length / total_height if total_height > 0 else 0,
            'arm_span_to_height_ratio': arm_span / total_height if total_height > 0 else 0,
            'torso_to_total_ratio': torso_length / total_height if total_height > 0 else 0,
            'leg_to_total_ratio': leg_length / total_height if total_height > 0 else 0,
            'measurements': {
                'head_length': head_length,
                'total_height': total_height,
                'arm_span': arm_span,
                'torso_length': torso_length,
                'leg_length': leg_length
            }
        }
    
    def _analyze_geometry(self, points: Dict) -> Dict:
        """Analyze geometric properties like square and circle fits."""
        # Body center point
        center_x = (points['left_shoulder'][0] + points['right_shoulder'][0] + 
                   points['left_hip'][0] + points['right_hip'][0]) // 4
        center_y = (points['left_shoulder'][1] + points['right_shoulder'][1] + 
                   points['left_hip'][1] + points['right_hip'][1]) // 4
        
        # Check if pose fits within a square
        extreme_points = [
            points['left_wrist'], points['right_wrist'],
            points['nose'], points['left_ankle'], points['right_ankle']
        ]
        
        min_x = min(p[0] for p in extreme_points)
        max_x = max(p[0] for p in extreme_points)
        min_y = min(p[1] for p in extreme_points)
        max_y = max(p[1] for p in extreme_points)
        
        width = max_x - min_x
        height = max_y - min_y
        
        square_ratio = min(width, height) / max(width, height) if max(width, height) > 0 else 0
        
        # Calculate symmetry
        left_points = [points['left_shoulder'], points['left_elbow'], 
                      points['left_wrist'], points['left_hip'], 
                      points['left_knee'], points['left_ankle']]
        right_points = [points['right_shoulder'], points['right_elbow'], 
                       points['right_wrist'], points['right_hip'], 
                       points['right_knee'], points['right_ankle']]
        
        symmetry_score = self._calculate_symmetry(left_points, right_points, center_x)
        
        return {
            'square_ratio': square_ratio,
            'symmetry_score': symmetry_score,
            'bounding_box': {'width': width, 'height': height},
            'center_point': (center_x, center_y)
        }
    
    def _calculate_vitruvian_score(self, proportions: Dict, geometry: Dict) -> float:
        """Calculate overall Vitruvian Man similarity score (0-100)."""
        # Ideal Vitruvian proportions
        ideal_head_ratio = 1/8  # Head should be 1/8 of total height
        ideal_arm_span_ratio = 1.0  # Arm span should equal height
        ideal_torso_ratio = 0.3  # Approximate torso proportion
        ideal_leg_ratio = 0.5   # Approximate leg proportion
        
        # Score each proportion (closer to ideal = higher score)
        head_score = max(0, 100 - abs(proportions['head_to_total_ratio'] - ideal_head_ratio) * 800)
        arm_span_score = max(0, 100 - abs(proportions['arm_span_to_height_ratio'] - ideal_arm_span_ratio) * 100)
        torso_score = max(0, 100 - abs(proportions['torso_to_total_ratio'] - ideal_torso_ratio) * 300)
        leg_score = max(0, 100 - abs(proportions['leg_to_total_ratio'] - ideal_leg_ratio) * 200)
        
        # Geometric scores
        square_score = geometry['square_ratio'] * 100
        symmetry_score = geometry['symmetry_score'] * 100
        
        # Weighted average
        total_score = (
            head_score * 0.15 +
            arm_span_score * 0.25 +
            torso_score * 0.15 +
            leg_score * 0.15 +
            square_score * 0.15 +
            symmetry_score * 0.15
        )
        
        return min(100, max(0, total_score))
    
    def _calculate_symmetry(self, left_points: List, right_points: List, center_x: int) -> float:
        """Calculate bilateral symmetry score."""
        if len(left_points) != len(right_points):
            return 0.0
            
        symmetry_errors = []
        for left_pt, right_pt in zip(left_points, right_points):
            left_dist = abs(left_pt[0] - center_x)
            right_dist = abs(right_pt[0] - center_x)
            if left_dist + right_dist > 0:
                symmetry_errors.append(abs(left_dist - right_dist) / (left_dist + right_dist))
        
        if not symmetry_errors:
            return 0.0
            
        avg_error = sum(symmetry_errors) / len(symmetry_errors)
        return max(0, 1 - avg_error)
    
    def _distance(self, p1: Tuple[int, int], p2: Tuple[int, int]) -> float:
        """Calculate Euclidean distance between two points."""
        return math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)
    
    def _generate_analysis(self, score: float, proportions: Dict, geometry: Dict) -> str:
        """Generate human-readable analysis."""
        if score >= 80:
            level = "Excellent"
        elif score >= 60:
            level = "Good" 
        elif score >= 40:
            level = "Fair"
        else:
            level = "Poor"
            
        analysis = f"Vitruvian Man Analysis: {level} ({score:.1f}/100)\n\n"
        
        analysis += f"Proportions:\n"
        analysis += f"- Head to height ratio: {proportions['head_to_total_ratio']:.3f} (ideal: 0.125)\n"
        analysis += f"- Arm span to height: {proportions['arm_span_to_height_ratio']:.3f} (ideal: 1.000)\n"
        analysis += f"- Symmetry score: {geometry['symmetry_score']:.3f}\n"
        analysis += f"- Square fit ratio: {geometry['square_ratio']:.3f}\n"
        
        return analysis

def main():
    parser = argparse.ArgumentParser(description='Analyze human pose for Vitruvian Man proportions')
    parser.add_argument('image_path', help='Path to input image')
    parser.add_argument('--output', '-o', help='Output JSON file path')
    parser.add_argument('--verbose', '-v', action='store_true', help='Verbose output')
    
    args = parser.parse_args()
    
    analyzer = VitruvianAnalyzer()
    
    try:
        result = analyzer.analyze_image(args.image_path)
        
        if args.output:
            with open(args.output, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"Results saved to {args.output}")
        else:
            if args.verbose:
                print(json.dumps(result, indent=2))
            else:
                print(result['analysis'])
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()