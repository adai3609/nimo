#!/usr/bin/env python3
"""
简单的测试程序
演示基本的计算功能
"""

def add_numbers(a, b):
    """两个数相加"""
    return a + b

def main():
    """主函数"""
    print("欢迎使用测试计算器!")
    
    # 示例计算
    result = add_numbers(5, 3)
    print(f"5 + 3 = {result}")
    
    # 交互式计算
    try:
        num1 = float(input("请输入第一个数字: "))
        num2 = float(input("请输入第二个数字: "))
        result = add_numbers(num1, num2)
        print(f"{num1} + {num2} = {result}")
    except ValueError:
        print("请输入有效的数字!")
    except KeyboardInterrupt:
        print("\n程序已退出!")

if __name__ == "__main__":
    main()