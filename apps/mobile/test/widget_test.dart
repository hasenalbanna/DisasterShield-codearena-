import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/main.dart';

void main() {
  testWidgets('DisasterShield renders navigation shell and theme toggle', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: DisasterShieldApp()));

    expect(find.text('DisasterShield'), findsOneWidget);
    expect(find.text('Map'), findsOneWidget);
    expect(find.text('Report'), findsOneWidget);
    expect(find.text('SOS'), findsOneWidget);
    expect(find.text('Tracker'), findsOneWidget);
    expect(find.text('Safety'), findsOneWidget);
  });
}
