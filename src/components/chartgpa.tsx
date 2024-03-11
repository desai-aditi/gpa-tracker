// Import necessary modules from React, echarts, and antd
import React, { useEffect, useState, useRef } from 'react';
import * as echarts from 'echarts/core';
import { Slider, Input, Select, Button, Switch, Radio } from 'antd';
import { GridComponent, TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { EChartsType } from 'echarts/core';

import '../css/chartgpa.css'; // Import your custom styles

const { Option } = Select;

// Initialize echarts components
echarts.use([GridComponent, TooltipComponent, BarChart, CanvasRenderer]);

// Define types for Course and CalculationMode
type Course = {
  name: string;
  grade: number;
  targetGrade?: number; // New field to store target grade
  weight: string;
};

type CalculationMode = 'unweighted' | 'weighted';

// Define the main component for calculating GPA
const CalculateGPA: React.FC = () => {
  // State variables for courses, GPA, target GPA, target mode, calculation mode, and chart reference
  const [courses, setCourses] = useState<Course[]>([
    { name: 'Course 1', grade: 75, weight: 'normal' },
    { name: 'Course 2', grade: 80, weight: 'normal' }
  ]);
  const [gpa, setGpa] = useState<number | null>(null);
  const [targetGpa, setTargetGpa] = useState<number | null>(null);
  const [isTargetMode, setIsTargetMode] = useState<boolean>(false);
  const [calculationMode, setCalculationMode] = useState<CalculationMode>('weighted'); // Added state
  const chartRef = useRef<HTMLDivElement | null>(null);

  // Effect hook to initialize the chart and calculate GPA when dependencies change
  useEffect(() => {
    try {
      // Initialize the chart if the chartRef is available
      if (chartRef.current) {
        const myChart = echarts.init(chartRef.current);
        updateChart(myChart, courses, targetGpa, isTargetMode);
      }
      // Calculate GPA based on courses, target mode, and calculation mode
      calculateGPA(courses, isTargetMode, calculationMode);
    } catch (error) {
      // Log an error if there is an issue initializing the chart
      console.error('Error initializing chart:', error);
    }
  }, [courses, targetGpa, isTargetMode, calculationMode]);

  // Function to handle changes in course grades
  const handleGradeChange = (index: number, value: number) => {
    const newCourses = [...courses];
    if (isTargetMode) {
      // Adjust the target grade and recalculate GPA if in target mode
      newCourses[index].targetGrade = value;
      calculateGPA(newCourses, isTargetMode, calculationMode);
    } else {
      // Adjust the current grade
      newCourses[index].grade = value;
    }
    setCourses(newCourses);
  };

  // Function to add a new course if not in target mode
  const handleAddCourse = () => {
    if (!isTargetMode) {
      const updatedCourses = [...courses, { name: `Course ${courses.length + 1}`, grade: 75, weight: 'normal' }];
      setCourses(updatedCourses);
      calculateGPA(updatedCourses, isTargetMode, calculationMode);
    }
  };

  // Function to switch between target and current mode
  const handleSwitchMode = () => {
    setIsTargetMode(!isTargetMode);
  
    // Initialize target grades if entering target mode for the first time
    if (!isTargetMode) {
      const updatedCourses = courses.map(course => ({
        ...course,
        targetGrade: course.grade, // Set the default target grade to be the same as the current grade
      }));
      setCourses(updatedCourses);
      calculateGPA(updatedCourses, !isTargetMode, calculationMode); // Pass !isTargetMode to calculate for the current mode
    }
  };  

  // Function to update the chart based on the provided data
  const updateChart = (chart: EChartsType, courses: Course[], targetGpa: number | null, isTargetMode: boolean) => {
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['Current Grade', 'Target Grade'],
      },
      xAxis: {
        type: 'category',
        data: courses.map(course => course.name),
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
      },
      series: [
        {
          name: 'Current Grade',
          type: 'bar',
          data: courses.map(course => course.grade),
          itemStyle: { color: '#5470C6' },
        },
        {
          name: 'Target Grade',
          type: 'bar',
          data: isTargetMode ? courses.map(course => course.targetGrade ?? course.grade) : [],
          itemStyle: { color: '#91CC75' },
        },
      ],
    };

    chart.setOption(option);
  };

  // Function to calculate GPA based on updated courses, mode, and target mode
  const calculateGPA = (updatedCourses: Course[], isTargetMode: boolean, mode: CalculationMode) => {
    let totalOriginalPoints = 0;
    let totalCourses = updatedCourses.length;

    updatedCourses.forEach(course => {
      let points = 0;

      if (mode === 'weighted') {
        if (course.grade >= 90) points = 4.0;
        else if (course.grade >= 80) points = 3.0;
        else if (course.grade >= 70) points = 2.0;
        else if (course.grade >= 60) points = 1.0;

        if (course.weight === 'honors') points += 0.5;
        else if (course.weight === 'ap') points += 1.0;
      } else {
        // 'unweighted' mode
        if (course.grade >= 90) points = 4.0;
        else if (course.grade >= 80) points = 3.0;
        else if (course.grade >= 70) points = 2.0;
        else if (course.grade >= 60) points = 1.0;
      }

      totalOriginalPoints += points;
    });

    const newGPA = totalOriginalPoints / totalCourses;
    setGpa(newGPA);

    if (isTargetMode) {
      // Calculate target GPA if in target mode
      let targetPoints = 0;
      updatedCourses.forEach(course => {
        let targetCoursePoints = 0;
        if (course.targetGrade !== undefined) {
          if (mode === 'weighted') {
            if (course.targetGrade >= 90) targetCoursePoints = 4.0;
            else if (course.targetGrade >= 80) targetCoursePoints = 3.0;
            else if (course.targetGrade >= 70) targetCoursePoints = 2.0;
            else if (course.targetGrade >= 60) targetCoursePoints = 1.0;

            if (course.weight === 'honors') targetCoursePoints += 0.5;
            else if (course.weight === 'ap') targetCoursePoints += 1.0;
          } else {
            // 'unweighted' mode
            if (course.targetGrade >= 90) targetCoursePoints = 4.0;
            else if (course.targetGrade >= 80) targetCoursePoints = 3.0;
            else if (course.targetGrade >= 70) targetCoursePoints = 2.0;
            else if (course.targetGrade >= 60) targetCoursePoints = 1.0;
          }
        }
        targetPoints += targetCoursePoints;
      });

      const newTargetGPA = targetPoints / totalCourses;
      setTargetGpa(newTargetGPA);
    }
  };

  // Return the JSX for the component
  return (
      <div className='chart-gpa'>
        <div className="gpa-buttons">
            <Button className="gpa-button" size='large'>
                {`Current GPA: ${gpa !== null ? gpa.toFixed(2) : 'N/A'}`}
            </Button>

            {isTargetMode && (
                <Button className="gpa-button" size='large'>
                {`Target GPA: ${targetGpa !== null ? targetGpa.toFixed(2) : 'N/A'}`}
                </Button>
            )}
        </div>

        <div className="chart-gpa-container">
          <div ref={chartRef} style={{ width: '100%', height: '400px' }}></div>

          <div className="toggles">
            <Radio.Group
                onChange={(e) => setCalculationMode(e.target.value)}
                value={calculationMode}
                style={{ marginBottom: '10px' }}
                >
                <Radio value="weighted">Weighted</Radio>
                <Radio value="unweighted">Unweighted</Radio>
            </Radio.Group>

            <Switch checkedChildren="Target Mode" unCheckedChildren="Current Mode" checked={isTargetMode} onChange={handleSwitchMode} />

          </div>
          <div className='courses'>
            {courses.map((course, index) => (
              <div key={index} className="course-container">
                <div className="course-fields">
                    <Input
                    placeholder="Course Name"
                    value={course.name}
                    onChange={(e) => {
                        const newCourses = [...courses];
                        newCourses[index].name = e.target.value;
                        setCourses(newCourses);
                    }}
                    style={{ width: 200, marginRight: '10px' }}
                    disabled={isTargetMode} // Disabled in target mode
                    />
                    {calculationMode === 'weighted' && (
                        <Select
                            defaultValue="normal"
                            value={course.weight}
                            style={{ width: 120, marginLeft: '10px' }}
                            onChange={(value) => {
                                const newCourses = [...courses];
                                newCourses[index].weight = value;
                                setCourses(newCourses);
                            }}
                            disabled={isTargetMode} // Keep this disabled in target mode if you don't want weight changes there
                            >
                            <Option value="normal">Normal</Option>
                            <Option value="honors">Honors</Option>
                            <Option value="ap">AP</Option>
                        </Select>
                    )}
                </div>
                <Slider
                    min={0}
                    max={100}
                    onChange={(value) => handleGradeChange(index, value)}
                    value={isTargetMode ? course.targetGrade ?? course.grade : course.grade}
                />
              </div>
            ))}
            
          </div>
          <Button onClick={handleAddCourse} disabled={isTargetMode}>
              Add More
            </Button>
        </div>
      </div>
  );
}  

export default CalculateGPA;
